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
import { ENetworks, EPortfolioType, EXPubCurrency } from '@rana/core'
import { ConfigService } from '@nestjs/config'
import { ethers, BigNumber } from 'ethers'
import { EEnvironment } from '../environments/environment.types'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import {
  IAssetDetail,
  IBTCTransactionResponse,
  IEthTransaction,
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
import { getAddress, isAddress } from 'ethers/lib/utils'
import { Network, validate } from 'bitcoin-address-validation'

@Injectable()
export class AssetService {
  goerliProvider: ethers.providers.EtherscanProvider
  mainnetProvider: ethers.providers.EtherscanProvider
  alchemyInstance
  princessAPIUrl: string
  liquidAPIKey: string
  liquidTestAPIKey: string
  liquidAPIUrl: string
  liquidTestAPIUrl: string
  etherscanAPIKey: string
  offset = 200

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private nftService: NftService,
    @Inject(forwardRef(() => PortfolioService))
    private portfolioService: PortfolioService,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>, // private readonly accountService: AccountService,
  ) {
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
      Sentry.captureException(`getEthPartialHistory(): ${err.message}`)
    }

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

        const newHistory: ITransaction = {
          asset,
          from: record.from || '',
          to: record.to || '',
          hash: record.hash,
          amount: value.toString(),
          balance: prevBalance.toString(),
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
              // eslint-disable-next-line no-empty
            } catch (err) {}
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
        ? transactions[0].blockNumber - 1
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

    let currentBalance = balance
    const allHistories = await Promise.all(
      transactions.slice(from).map((record) => {
        const prevBalance = currentBalance
        currentBalance = record.spent
          ? currentBalance - record.value
          : currentBalance + record.value
        return this.addHistory({
          asset: asset,
          from: record.spent ? asset.address : '',
          to: record.spent ? '' : asset.address,
          amount: record.value.toString(),
          hash: record.tx_hash,
          fee: '0',
          blockNumber: record.block_height,
          balance: prevBalance.toString(),
          timestamp: Math.floor(new Date(record.confirmed).getTime() / 1000),
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
    walletEntity?: WalletEntity,
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

    let asset: AssetEntity
    asset = await this.assetRepository.findOne({
      where: { address: validAddress, network },
    })
    if (asset) {
      if (walletEntity) {
        if (!asset.wallets || asset.wallets.length === 0) {
          asset.wallets = [walletEntity]
          await this.assetRepository.save(asset)
        } else {
          const walletIds = asset.wallets.map((wallet) => wallet.id)
          if (!walletIds.includes(walletEntity.id)) {
            asset.wallets.push(walletEntity)
            await this.assetRepository.save(asset)
          }
        }
      }
      return asset
    }

    asset = await this.addAsset(
      validAddress,
      index,
      network,
      publicKey,
      walletEntity,
    )
    await this.portfolioService.updateCurrentWallets()
    this.portfolioService.fetchEthereumTransactions(network)

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
    walletEntity?: WalletEntity,
  ) {
    const prototype = new AssetEntity()
    prototype.wallets = walletEntity ? [walletEntity] : []
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

    return assetEntity
  }

  async updateHistory(
    updatedAsset: AssetEntity,
    tx: {
      transaction: {
        from: string
        to: string
        value: string
        hash: string
        blockNumber: number
      }
    },
    amount: BigNumber,
    fee: BigNumber,
  ) {
    const transactions = updatedAsset.transactions
    const newHistoryData = {
      from: tx.transaction.from,
      to: tx.transaction.to,
      value: tx.transaction.value.toString(),
      hash: tx.transaction.hash,
      blockNumber: tx.transaction.blockNumber,
      balance: transactions.length
        ? BigNumber.from(transactions[0].balance).sub(amount).toString()
        : BigNumber.from(tx.transaction.value).toString(),
      timestamp: this.portfolioService.getCurrentTimeBySeconds(),
      fee: fee.toString(),
      status:
        updatedAsset.address === tx.transaction.from
          ? ETransactionStatuses.SENT
          : ETransactionStatuses.RECEIVED,
    }

    let newHistory
    try {
      newHistory = await this.addHistory({
        asset: updatedAsset,
        ...newHistoryData,
      })
    } catch (err) {
      Sentry.captureException(
        `${err.message} + " in updateHistory(address: ${updatedAsset.address}, hash: ${tx.transaction.hash}`,
      )
      return
    }

    transactions.push(newHistory)
    updatedAsset.transactions = transactions

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
          `addAddressesFromXPub(): ${err.response.data.errors[0]}: ${xPub}`,
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
      nfts: [],
    }

    if (transactions.length > 0) {
      asset.transaction = transactions[0]
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

  async getAssetTransactions(
    assetId: string,
    accountId: string,
    start: number,
    count: number,
  ) {
    const transactions = await this.transactionRepository.find({
      where: {
        asset: {
          id: assetId,
          wallets: {
            account: {
              accountId: accountId,
            },
          },
        },
      },
      order: {
        timestamp: 'DESC',
      },
      take: count,
      skip: start,
    })

    return transactions
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
}
