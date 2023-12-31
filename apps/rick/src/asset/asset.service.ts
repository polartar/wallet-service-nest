import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common'
import { AssetEntity } from '../wallet/asset.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { ECoinTypes, ENetworks, EXPubCurrency, getTimestamp } from '@rana/core'
import { ConfigService } from '@nestjs/config'
import { ethers, BigNumber } from 'ethers'
import { EEnvironment } from '../environments/environment.types'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import {
  IAssetDetail,
  IBTCTransactionResponse,
  IEthTransaction,
  IMarketData,
  ITransaction,
  IXPubInfo,
} from './asset.types'
import { TransactionEntity } from '../wallet/transaction.entity'
import ERC721ABI from '../asset/abis/erc721'
import ERC1155ABI from '../asset/abis/erc1155'
import * as Sentry from '@sentry/node'
import { PortfolioService } from '../portfolio/portfolio.service'
import { ETransactionStatuses } from '../wallet/wallet.types'
import { NftService } from '../nft/nft.service'
import {
  formatEther,
  formatUnits,
  getAddress,
  isAddress,
} from 'ethers/lib/utils'
import { Network, validate } from 'bitcoin-address-validation'
import { NftEntity } from '../wallet/nft.entity'

@Injectable()
export class AssetService {
  goerliProvider: ethers.providers.EtherscanProvider
  mainnetProvider: ethers.providers.EtherscanProvider
  princessAPIUrl: string
  liquidAPIKey: string
  liquidTestAPIKey: string
  liquidAPIUrl: string
  liquidTestAPIUrl: string
  etherscanAPIKey: string
  offset = 200
  mortyApiUrl: string

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private nftService: NftService,
    @Inject(forwardRef(() => PortfolioService))
    private portfolioService: PortfolioService,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {
    this.mortyApiUrl = this.configService.get<string>(EEnvironment.mortyAPIUrl)
    this.etherscanAPIKey = this.configService.get<string>(
      EEnvironment.etherscanAPIKey,
    )
    this.goerliProvider = new ethers.providers.EtherscanProvider(
      'goerli',
      this.etherscanAPIKey,
    )

    this.mainnetProvider = new ethers.providers.EtherscanProvider(
      'mainnet',
      this.etherscanAPIKey,
    )

    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )

    this.liquidAPIKey = this.configService.get<string>(
      EEnvironment.liquidAPIKey,
    )
    this.liquidTestAPIKey = this.configService.get<string>(
      EEnvironment.liquidTestAPIKey,
    )
    this.liquidAPIUrl = this.configService.get<string>(
      EEnvironment.liquidAPIUrl,
    )
    this.liquidTestAPIUrl = this.configService.get<string>(
      EEnvironment.liquidTestAPIUrl,
    )
  }

  async getAllAssets(): Promise<AssetEntity[]> {
    return await this.assetRepository.find({
      order: {
        transactions: {
          timestamp: 'DESC',
        },
      },
      relations: {
        wallets: {
          account: true,
        },
        transactions: true,
      },
    })
  }

  async addHistory(data: ITransaction): Promise<TransactionEntity> {
    try {
      return await this.transactionRepository.save(data)
    } catch (err) {
      Sentry.captureException(`addHistory(): ${err.message}`)
    }
  }

  async getEthPartialHistory(
    asset: AssetEntity,
    firstBlock: number,
    balance: BigNumber,
    page: number,
  ): Promise<{ balance: BigNumber; transactions: TransactionEntity[] }> {
    const url = `https://${
      asset.network === ENetworks.ETHEREUM
        ? 'api.etherscan.io'
        : 'api-goerli.etherscan.io'
    }/api?module=account&action=txlist&address=${
      asset.address
    }&startblock=${firstBlock}&sort=desc&apikey=${
      this.etherscanAPIKey
    }&page=${page}&offset=${this.offset}`

    let transactions: IEthTransaction[]

    const internalUrl = url.replace('txlist', 'txlistinternal')

    try {
      const response = await firstValueFrom(this.httpService.get(url))

      if (response.data.status === '1') {
        transactions = response.data.result
      } else {
        throw new BadRequestException(response.data.message)
      }
    } catch (err) {
      Sentry.captureException(`getEthPartialHistory(): ${err.message}`)
      return { balance, transactions: [] }
    }

    // fetch internal transactions
    try {
      const response = await firstValueFrom(this.httpService.get(internalUrl))

      if (response.data.status === '0') {
        throw new BadRequestException(response.data.message)
      }
      if (response.data.result.length > 0) {
        transactions = transactions.concat(response.data.result)
        transactions.sort((a, b) => {
          if (a.blockNumber < b.blockNumber) {
            return 1
          }
          return -1
        })
      }
    } catch (err) {
      // continue regardless of error
    }

    const ethMarketHistories = await this.getHistoricalData(
      ECoinTypes.ETHEREUM,
      transactions[transactions.length - 1].timeStamp,
      transactions[0].timeStamp,
    )

    let currentBalance = balance
    const histories = transactions.map((record) => {
      const prevBalance = currentBalance

      const fee =
        record.gasUsed === '0'
          ? BigNumber.from('0')
          : BigNumber.from(record.gasUsed).mul(BigNumber.from(record.gasPrice))
      const value = BigNumber.from(record.value)

      const walletAddress = asset.address.toLowerCase()
      let status
      if (record.from?.toLowerCase() === walletAddress) {
        currentBalance = currentBalance.add(fee)
        if (record.isError === '0') {
          currentBalance = currentBalance.add(value)
          status = ETransactionStatuses.SENT
        } else {
          status = ETransactionStatuses.FAILED
        }
      }

      //consider if transferred itself
      if (record.to?.toLowerCase() === walletAddress) {
        currentBalance = currentBalance.sub(value)
        status =
          record.isError === '0'
            ? ETransactionStatuses.RECEIVED
            : ETransactionStatuses.FAILED
      }
      if (record.type === 'call') {
        status = ETransactionStatuses.INTERNAL
      }

      const price = this.getUSDPrice(ethMarketHistories, record.timeStamp)

      const newHistory = new TransactionEntity()
      newHistory.asset = asset
      newHistory.from = record.from || ''
      newHistory.to = record.to || ''
      newHistory.hash = record.hash
      newHistory.cryptoAmount = value.toString()
      newHistory.fiatAmount = (+formatEther(value) * price).toFixed(2)
      newHistory.balance = prevBalance.toString()
      newHistory.usdPrice = (+formatEther(prevBalance) * price).toFixed(2)
      newHistory.timestamp = +record.timeStamp
      newHistory.status = status
      newHistory.blockNumber = record.blockNumber
      newHistory.fee =
        status === ETransactionStatuses.SENT ? fee.toString() : '0'

      // parse the transaction
      if (value.isZero()) {
        let iface = new ethers.utils.Interface(ERC721ABI)
        let response
        try {
          response = iface.parseTransaction({ data: record.input })
        } catch (err) {
          iface = new ethers.utils.Interface(ERC1155ABI)
          try {
            response = iface.parseTransaction({ data: record.input })
          } catch (err) {
            // continue regardless of error
          }
        }
        // only track the transfer functions
        if (response && response.name.toLowerCase().includes('transfer')) {
          const { from, tokenId, id } = response.args
          newHistory.from = from || record.from
          newHistory.tokenId = tokenId?.toString() || id?.toString()
        }
      }

      return newHistory
    })

    await this.transactionRepository.insert(histories)

    return { balance: currentBalance, transactions: histories }
  }

  async getEthHistory(asset: AssetEntity, firstBlock = 0) {
    const provider =
      asset.network === ENetworks.ETHEREUM
        ? this.mainnetProvider
        : this.goerliProvider

    const currentBalance = await provider.getBalance(asset.address)
    let balance = currentBalance
    let page = 1

    while (page) {
      const { balance: nextBalance, transactions } =
        await this.getEthPartialHistory(asset, firstBlock, balance, page++)
      balance = nextBalance

      if (transactions.length > 0) {
        asset.transactions = asset.transactions.concat(transactions)
        await this.assetRepository.save(asset)
      }
      if (transactions.length !== this.offset) {
        if (page === 1) return null
        return currentBalance
      }
    }
  }

  async confirmETHBalance(asset: AssetEntity): Promise<AssetEntity> {
    const transactions = asset.transactions
    const lastBlockNumber =
      transactions && transactions.length > 0
        ? (transactions[0].blockNumber || 1) + 1
        : 0

    const response = await this.getEthHistory(asset, lastBlockNumber)

    if (response !== null) {
      return asset
    }

    return null
  }

  async getBtcHistory(
    asset: AssetEntity,
    from: number,
  ): Promise<TransactionEntity[]> {
    const txResponse: { data: IBTCTransactionResponse } = await firstValueFrom(
      this.httpService.get(
        `https://api.blockcypher.com/v1/btc/${
          asset.network === ENetworks.BITCOIN ? 'main' : 'test3'
        }/addrs/${asset.address}`,
        {
          timeout: 1800000, // 30 mins
        },
      ),
    )

    if (
      !txResponse ||
      !txResponse.data ||
      !txResponse.data.txrefs ||
      txResponse.data.txrefs.length === 0
    ) {
      return []
    }

    const transactions = txResponse.data.txrefs

    const btcMarketHistories = await this.getHistoricalData(
      ECoinTypes.BITCOIN,
      getTimestamp(transactions[transactions.length - 1].confirmed),
      getTimestamp(transactions[0].confirmed),
    )

    const allHistories = transactions.slice(from).map((record) => {
      const price = this.getUSDPrice(
        btcMarketHistories,
        getTimestamp(record.confirmed),
      )
      const newHistory = new TransactionEntity()
      newHistory.asset = asset
      newHistory.from = record.tx_output_n === -1 ? asset.address : ''
      newHistory.to = record.tx_input_n === -1 ? asset.address : ''
      newHistory.cryptoAmount = record.value.toString()
      newHistory.fiatAmount = (+formatUnits(record.value, 8) * price).toFixed(2)
      newHistory.hash = record.tx_hash
      newHistory.fee = '0'
      newHistory.blockNumber = record.block_height
      newHistory.balance = record.ref_balance.toString()
      newHistory.usdPrice = (
        +formatUnits(record.ref_balance, 8) * price
      ).toFixed(2)
      newHistory.timestamp = getTimestamp(record.confirmed)
      newHistory.status =
        record.tx_output_n === -1
          ? ETransactionStatuses.SENT
          : ETransactionStatuses.RECEIVED

      return newHistory
    })

    await this.transactionRepository.insert(allHistories)

    return allHistories
  }

  async confirmBTCBalance(asset: AssetEntity): Promise<AssetEntity> {
    try {
      const transactions = await this.getBtcHistory(
        asset,
        asset.transactions.length,
      )

      if (transactions.length > 0) {
        return asset
      }
    } catch (err) {
      Sentry.captureException(
        `Confirm BTCBalance: ${asset.address} : ${err.message}`,
      )
    }

    return null
  }

  // If there are missed transactions, they are added to history table
  async confirmWalletBalances(assets?: AssetEntity[]) {
    if (!assets) {
      assets = await this.getAllAssets()
    }

    const updatedAssets = await Promise.all(
      assets.map(async (asset: AssetEntity) => {
        if (
          asset.network === ENetworks.BITCOIN ||
          asset.network === ENetworks.BITCOIN_TEST
        ) {
          return await this.confirmBTCBalance(asset)
        } else {
          return await this.confirmETHBalance(asset)
        }
      }),
    )

    this.assetRepository.save(updatedAssets.filter((asset) => !!asset))
  }

  async createAsset(
    address: string,
    index: number,
    network: ENetworks,
    publicKey: string,
  ) {
    let validAddress

    if (network === ENetworks.ETHEREUM || network === ENetworks.ETHEREUM_TEST) {
      if (!isAddress(address)) {
        throw new BadRequestException('Invalid address')
      }
      validAddress = getAddress(address)
    } else {
      if (
        !validate(
          address,
          network === ENetworks.BITCOIN ? Network.mainnet : Network.testnet,
        )
      ) {
        throw new BadRequestException('Invalid address')
      }
      validAddress = address
    }

    const { asset, isNew } = await this.addAsset(
      validAddress,
      index,
      network,
      publicKey,
    )

    if (isNew) {
      if (
        network === ENetworks.ETHEREUM ||
        network === ENetworks.ETHEREUM_TEST
      ) {
        this.portfolioService.addAddressesToWebhook([address], network)
        this.nftService.getNftTransactions(asset)
      }
    }

    return {
      asset: {
        id: asset.id,
        address,
        network,
        index,
        publicKey,
      },
      isNew,
    }
  }

  async addAsset(
    address: string,
    index: number,
    network: ENetworks,
    publicKey: string,
  ): Promise<{ asset: AssetEntity; isNew: boolean }> {
    const asset = await this.assetRepository.findOne({
      where: { address, network },
    })
    if (asset) {
      return { asset, isNew: false }
    }
    const prototype = new AssetEntity()
    prototype.wallets = []
    prototype.address = address
    prototype.publicKey = publicKey
    prototype.transactions = []
    prototype.index = index
    prototype.network = network

    const assetEntity = await this.assetRepository.save(prototype)

    try {
      if (
        network === ENetworks.ETHEREUM ||
        network === ENetworks.ETHEREUM_TEST
      ) {
        this.getEthHistory(assetEntity)
      } else {
        this.getBtcHistory(assetEntity, 0)
      }
    } catch (err) {
      Sentry.captureException(`addAsset(): ${err.message}`)
    }

    return { asset: assetEntity, isNew: true }
  }

  async getLastTransactionFromAssetId(assetId: string) {
    return await this.transactionRepository.findOne({
      where: {
        asset: {
          id: assetId,
        },
      },
      order: {
        timestamp: 'DESC',
      },
    })
  }

  async addAssetFromXPub(
    xPub: string,
    index: number,
    network: ENetworks,
    address: string,
    publicKey: string,
  ) {
    try {
      let apiURL, apiKey, currency
      if (network === ENetworks.ETHEREUM || network === ENetworks.BITCOIN) {
        apiURL = this.liquidAPIUrl
        apiKey = this.liquidAPIKey
      } else {
        apiURL = this.liquidTestAPIUrl
        apiKey = this.liquidTestAPIKey
      }

      if (
        network === ENetworks.ETHEREUM ||
        network === ENetworks.ETHEREUM_TEST
      ) {
        currency = EXPubCurrency.ETHEREUM
      } else {
        currency = EXPubCurrency.BITCOIN
      }

      const discoverResponse = await firstValueFrom(
        this.httpService.get(
          `${apiURL}/api/v1/currencies/${currency}/accounts/discover?xpub=${xPub}`,
          {
            headers: { 'api-secret': apiKey },
          },
        ),
      )

      const assets = await Promise.all(
        discoverResponse.data.data.map(async (item: IXPubInfo) => {
          return await this.createAsset(
            item.address,
            item.index,
            network,
            item.publickey,
          )
        }),
      )

      return assets
    } catch (err) {
      if (err.response) {
        Sentry.captureException(
          `addAddressesFromXPub(): ${JSON.stringify(
            err.response.data.errors[0],
          )}: ${xPub}`,
        )
      } else {
        Sentry.captureException(
          `addAddressesFromXPub(): ${err.message}: ${xPub}`,
        )
      }
      const asset = await this.createAsset(address, index, network, publicKey)
      return [asset]
    }
  }

  async getAsset(assetId: string) {
    const assetEntity = await this.assetRepository.findOne({
      where: { id: assetId },
      relations: { transactions: true, nfts: true },
      order: {
        transactions: {
          timestamp: 'DESC',
          from: 'DESC',
        },
      },
    })
    if (!assetEntity) {
      throw new BadRequestException('Not found asset')
    }

    const transactions = assetEntity.transactions
    const asset: IAssetDetail = {
      id: assetEntity.id,
      index: assetEntity.index,
      network: assetEntity.network,
      address: assetEntity.address,
      publicKey: assetEntity.publicKey,
      balance: {
        fiat: '0',
        crypto: '0',
      },
      nfts: this.utilizeNfts(assetEntity.nfts),
    }

    if (transactions.length > 0) {
      asset.balance = {
        fiat: transactions[0].usdPrice,
        crypto: transactions[0].balance,
      }
    }

    return asset
  }

  async getAssetTransactions(assetId: string, accountId: string) {
    try {
      const asset = await this.assetRepository.findOne({
        where: { id: assetId, wallets: { account: { accountId } } },
        relations: { wallets: { account: true }, transactions: true },
        order: {
          transactions: { timestamp: 'DESC' },
        },
      })

      if (asset && asset.transactions.length) {
        return asset.transactions.map((transaction) => {
          return {
            ...transaction,
            timestamp: +transaction.timestamp,
            network: asset.network,
          }
        })
      }
      return []
    } catch (err) {
      Sentry.captureException(
        `getAssetTransactions(): assetId(${assetId}): ${err.message}`,
      )

      throw new InternalServerErrorException(err.message)
    }
  }

  async getAssetsByIds(assetIds: string[]) {
    try {
      return await this.assetRepository.find({
        where: { id: In(assetIds) },
      })
    } catch (err) {
      Sentry.captureException(`getAssetsByIds(): ${err.message}`)
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async getAssetPortfolio(assetId: string, accountId: string) {
    const asset = await this.assetRepository.findOne({
      where: {
        id: assetId,
        wallets: {
          account: {
            accountId: accountId,
          },
        },
      },
      relations: {
        transactions: true,
      },
      order: {
        transactions: { timestamp: 'DESC' },
      },
    })

    if (!asset) {
      Sentry.captureException(
        `getAssetPortfolio(): Not found asset(${assetId}) for account Id (${accountId})`,
      )
      throw new BadRequestException(`Not found asset(${assetId}) for the user`)
    }
    if (asset.transactions.length > 0) return asset.transactions[0]
    else return null
  }

  async getNftTransactions(assetId: string, pageNumber: number) {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
      relations: { nfts: true },
    })
    if (!asset) {
      Sentry.captureException(
        `getNftTransactions(): AssetId(${assetId}) Not found`,
      )

      throw new BadRequestException('Not found asset')
    }
    return this.utilizeNfts(asset.nfts)
  }

  utilizeNfts(nfts: NftEntity[]) {
    return nfts.map((nft) => ({
      metadata: {
        name: nft.name,
        description: nft.name,
        image: nft.image,
        externalUrl: nft.externalUrl,
        attributes: nft.attributes ? JSON.parse(nft.attributes) : [],
      },
      owner_of: nft.ownerOf,
      contract_type: nft.contractType,
      token_hash: nft.hash,
      network: nft.network,
      collection_address: nft.collectionAddress,
      token_id: nft.tokenId,
    }))
  }

  updateAssets(assets: AssetEntity[]) {
    return Promise.all(assets.map((asset) => this.assetRepository.save(asset)))
  }

  async getAssetById(assetId: string) {
    return await this.assetRepository.findOne({ where: { id: assetId } })
  }

  async getHistoricalData(
    coinType: ECoinTypes,
    startTime: number,
    endTime: number,
  ) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(
          `${this.mortyApiUrl}/api/market/${coinType}/period?startTime=${startTime}&endTime=${endTime}`,
        ),
      )
      return res.data
    } catch (err) {
      Sentry.captureException(err.message + 'in getHistoricalData()')
    }
  }

  getUSDPrice(source: IMarketData[], timestamp: number) {
    if (!source) {
      return 0
    }
    const index = source.findIndex(
      (market) =>
        new Date(market.periodEnd).getTime() / 1000 >= +timestamp &&
        +timestamp >= new Date(market.periodStart).getTime() / 1000,
    )

    return index !== -1 ? source[index].vwap : source[source.length - 1].vwap
  }

  async deleteAsset(assetId: string) {
    try {
      const asset = await this.assetRepository.findOne({
        where: { id: assetId },
        relations: { transactions: true, wallets: true },
      })

      if (asset.wallets.length === 1) {
        if (asset.transactions.length > 0) {
          await this.transactionRepository.delete({ asset: { id: assetId } })
        }

        await this.assetRepository.delete({ id: assetId })
        if (
          asset.network === ENetworks.ETHEREUM ||
          asset.network === ENetworks.ETHEREUM_TEST
        ) {
          this.portfolioService.addAddressesToWebhook(
            [asset.address],
            asset.network,
            true,
          )
        }
      }
    } catch (err) {
      Sentry.captureException(`deleteAsset(): ${err.message}`, {
        tags: {
          assetId,
        },
      })
    }
  }

  async getFullAsset(
    address: string,
    network: ENetworks,
  ): Promise<AssetEntity> {
    return await this.assetRepository.findOne({
      where: {
        address,
        network,
      },
      order: {
        transactions: {
          timestamp: 'DESC',
        },
      },
      relations: {
        wallets: {
          account: true,
        },
        transactions: true,
      },
    })
  }
}
