import { WalletEntity } from './../wallet/wallet.entity'
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
import {
  ECoinTypes,
  ENetworks,
  EPortfolioType,
  EXPubCurrency,
  getTimestamp,
} from '@rana/core'
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
    toBlock: number,
    balance: BigNumber,
    page: number,
  ): Promise<{ balance: BigNumber; transactions: TransactionEntity[] }> {
    const url = `https://${
      asset.network === ENetworks.ETHEREUM
        ? 'api.etherscan.io'
        : 'api-goerli.etherscan.io'
    }/api?module=account&action=txlist&address=${
      asset.address
    }&startblock=0&endblock=${toBlock}&sort=desc&apikey=${
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
    const histories = await Promise.all(
      transactions.map(async (record) => {
        const prevBalance = currentBalance

        const fee =
          record.gasUsed === '0'
            ? BigNumber.from('0')
            : BigNumber.from(record.gasUsed).mul(
                BigNumber.from(record.gasPrice),
              )
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

        const price = await this.getUSDPrice(
          ethMarketHistories,
          record.timeStamp,
        )

        const newHistory: ITransaction = {
          asset,
          from: record.from || '',
          to: record.to || '',
          hash: record.hash,
          cryptoAmount: value.toString(),
          fiatAmount: (+formatEther(value) * price).toFixed(2),
          balance: prevBalance.toString(),
          usdPrice: (+formatEther(prevBalance) * price).toFixed(2),
          timestamp: +record.timeStamp,
          status,
          blockNumber: record.blockNumber,
          fee: status === ETransactionStatuses.SENT ? fee.toString() : '0',
        }
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

        const history = await this.addHistory(newHistory)

        return history
      }),
    )

    return { balance: currentBalance, transactions: histories }
  }

  async getEthHistory(asset: AssetEntity, toBlock = 99999999) {
    const provider =
      asset.network === ENetworks.ETHEREUM
        ? this.mainnetProvider
        : this.goerliProvider

    const currentBalance = await provider.getBalance(asset.address)

    let balance = currentBalance
    let page = 1

    while (page) {
      const { balance: nextBalance, transactions } =
        await this.getEthPartialHistory(asset, toBlock, balance, page++)
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
    const transactions = asset.transactions.sort((a, b) => {
      if (a.blockNumber > b.blockNumber) {
        return 1
      }
      return -1
    })
    const lastBlockNumber =
      transactions && transactions.length > 0
        ? (transactions[0].blockNumber || 1) - 1
        : 99999999
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

    const balance = txResponse.data.balance

    const transactions = txResponse.data.txrefs

    const btcMarketHistories = await this.getHistoricalData(
      ECoinTypes.BITCOIN,
      getTimestamp(transactions[transactions.length - 1].confirmed),
      getTimestamp(transactions[0].confirmed),
    )

    let currentBalance = balance
    const allHistories = await Promise.all(
      transactions.slice(from).map((record) => {
        const prevBalance = currentBalance
        currentBalance = record.spent
          ? currentBalance - record.value
          : currentBalance + record.value
        const price = this.getUSDPrice(
          btcMarketHistories,
          getTimestamp(record.confirmed),
        )
        return this.addHistory({
          asset: asset,
          from: record.spent ? asset.address : '',
          to: record.spent ? '' : asset.address,
          cryptoAmount: record.value.toString(),
          fiatAmount: (+formatUnits(record.value, 8) * price).toFixed(2),
          hash: record.tx_hash,
          fee: '0',
          blockNumber: record.block_height,
          balance: prevBalance.toString(),
          usdPrice: (+formatUnits(balance, 8) * price).toFixed(2),
          timestamp: getTimestamp(record.confirmed),
          status: record.spent
            ? ETransactionStatuses.SENT
            : ETransactionStatuses.RECEIVED,
        })
      }),
    )

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
      await this.portfolioService.updateCurrentWallets()
      if (
        network === ENetworks.ETHEREUM ||
        network === ENetworks.ETHEREUM_TEST
      ) {
        this.portfolioService.fetchEthereumTransactions(network)
      }
    }

    return {
      id: asset.id,
      address,
      network,
      index,
      publicKey,
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

  async updateTransaction(
    updatedAsset: AssetEntity,
    tx: {
      transaction: {
        from: string
        to: string
        value: BigNumber
        hash: string
        blockNumber: string
      }
    },
    amount: BigNumber,
    fee: BigNumber,
  ) {
    const lastTransaction = await this.getLastTransactionFromAssetId(
      updatedAsset.id,
    )
    const price = await this.getCurrentUSDPrice(ECoinTypes.ETHEREUM)

    const balance = lastTransaction
      ? BigNumber.from(lastTransaction.balance).sub(amount)
      : BigNumber.from(tx.transaction.value)
    const weiBalance = formatEther(balance)
    const weiAmount = formatEther(tx.transaction.value)
    const newHistoryData: ITransaction = {
      asset: updatedAsset,
      from: tx.transaction.from,
      to: tx.transaction.to,
      cryptoAmount: tx.transaction.value.toString(),
      fiatAmount: (+weiAmount * price).toFixed(2),
      hash: tx.transaction.hash,
      blockNumber: BigNumber.from(tx.transaction.blockNumber).toNumber(),
      balance: balance.toString(),
      usdPrice: (+weiBalance * price).toFixed(2),
      timestamp: this.portfolioService.getCurrentTimeBySeconds(),
      fee: fee.toString(),
      status:
        updatedAsset.address === tx.transaction.from
          ? ETransactionStatuses.SENT
          : ETransactionStatuses.RECEIVED,
    }
    await this.addHistory(newHistoryData)

    const postUpdatedAddress = {
      assetId: updatedAsset.id,
      walletIds: updatedAsset.wallets.map((wallet) => wallet.id),
      accountId: updatedAsset.wallets.map((wallet) => wallet.account.id),
      newHistory: newHistoryData,
    }

    firstValueFrom(
      this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
        type: EPortfolioType.TRANSACTION,
        data: [postUpdatedAddress],
      }),
    ).catch(() => {
      Sentry.captureException(
        'Princess portfolio/updated api error in fetchEthereumTransactions()',
      )
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
        apiKey = this.liquidAPIKey
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
      return this.createAsset(address, index, network, publicKey)
    }
  }

  async getAsset(assetId: string) {
    const assetEntity = await this.assetRepository.findOne({
      where: { id: assetId },
      relations: { transactions: true },
      order: {
        transactions: {
          timestamp: 'DESC',
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
      nfts: [],
    }

    if (transactions.length > 0) {
      asset.balance = {
        fiat: transactions[0].usdPrice,
        crypto: transactions[0].balance,
      }
    }

    if (
      assetEntity.network === ENetworks.ETHEREUM ||
      assetEntity.network === ENetworks.ETHEREUM_TEST
    ) {
      try {
        const nftResponse = await this.nftService.getNFTAssets(
          assetEntity.address,
          assetEntity.network,
          1,
        )

        asset.nfts = nftResponse.nfts
      } catch (err) {
        Sentry.captureMessage(`getAsset(): ${err.message}`)
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

  async getNFTAssets(assetId: string, pageNumber: number) {
    const asset = await this.assetRepository.findOne({ where: { id: assetId } })
    if (!asset) {
      Sentry.captureException(`getNFTAssets(): AssetId(${assetId}) Not found`)

      throw new BadRequestException('Not found asset')
    }
    return this.nftService.getNFTAssets(
      asset.address,
      asset.network,
      pageNumber,
    )
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

      throw new InternalServerErrorException(err.message)
    }
  }

  async getCurrentUSDPrice(coinType: ECoinTypes): Promise<number> {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${this.mortyApiUrl}/api/market/${coinType}`),
      )
      return res.data.price
    } catch (err) {
      Sentry.captureException(err.message + 'in getCurrentUSDPrice()')

      throw new InternalServerErrorException(err.message)
    }
  }

  getUSDPrice(source: IMarketData[], timestamp: number) {
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
      }
    } catch (err) {
      Sentry.captureException(`deleteAsset(): ${err.message}`, {
        tags: {
          assetId,
        },
      })
    }
  }
}
