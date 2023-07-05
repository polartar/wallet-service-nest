import { WalletEntity } from './../wallet/wallet.entity'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { AssetEntity } from '../wallet/asset.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { In, MoreThan, Repository } from 'typeorm'
import { ENetworks, EPeriod, EPortfolioType } from '@rana/core'
import { ConfigService } from '@nestjs/config'
import { ethers, BigNumber } from 'ethers'
import { EEnvironment } from '../environments/environment.types'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { IBTCTransactionResponse, ITransaction, IXPubInfo } from './asset.types'
import { TransactionEntity } from '../wallet/transaction.entity'
import ERC721ABI from '../asset/abis/erc721'
import ERC1155ABI from '../asset/abis/erc1155'
import * as Sentry from '@sentry/node'
import { PortfolioService } from '../portfolio/portfolio.service'
import { EXPubCurrency, SecondsIn } from '../wallet/wallet.types'
import { NftService } from '../nft/nft.service'
import { isAddress } from 'ethers/lib/utils'

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
    this.goerliProvider = new ethers.providers.EtherscanProvider(
      'goerli',
      this.configService.get<string>(EEnvironment.etherscanAPIKey),
    )

    this.mainnetProvider = new ethers.providers.EtherscanProvider(
      'mainnet',
      this.configService.get<string>(EEnvironment.etherscanAPIKey),
    )

    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )
    this.confirmWalletBalances()

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

  addHistory(data: ITransaction) {
    return this.transactionRepository.save(data)
  }

  async getEthHistory(
    asset: AssetEntity,
    from: number,
  ): Promise<TransactionEntity[]> {
    const provider =
      asset.network === ENetworks.ETHEREUM
        ? this.mainnetProvider
        : this.goerliProvider
    const transactions = await provider.getHistory(asset.address)
    if (!transactions || !transactions.length) {
      return []
    }

    const balance = await provider.getBalance(asset.address)

    let currentBalance = balance
    const histories = await Promise.all(
      transactions
        .slice(from)
        .reverse()
        .map(async (record) => {
          const prevBalance = currentBalance
          const fee = record.gasLimit.mul(record.gasPrice)
          const walletAddress = asset.address.toLowerCase()

          if (record.from?.toLowerCase() === walletAddress) {
            currentBalance = currentBalance.add(fee)
            currentBalance = currentBalance.add(record.value)
          }
          //consider if transferred itself
          if (record.to?.toLowerCase() === walletAddress) {
            currentBalance = currentBalance.sub(record.value)
          }

          const newHistory: ITransaction = {
            asset,
            from: record.from || '',
            to: record.to || '',
            hash: record.hash,
            amount: record.value.toString(),
            balance: prevBalance.toString(),
            timestamp: +record.timestamp,
          }
          // parse the transaction
          if (record.value.isZero()) {
            let iface = new ethers.utils.Interface(ERC721ABI)
            let response
            try {
              response = iface.parseTransaction({ data: record.data })
            } catch (err) {
              iface = new ethers.utils.Interface(ERC1155ABI)
              try {
                response = iface.parseTransaction({ data: record.data })
                // eslint-disable-next-line no-empty
              } catch (err) {}
            }
            // only track the transfer functions
            if (response && response.name.toLowerCase().includes('transfer')) {
              const { from, to, tokenId, id } = response.args
              newHistory.from = from || record.from
              newHistory.to = to
              newHistory.tokenId = tokenId?.toString() || id?.toString()
            }
          }

          return await this.addHistory(newHistory)
        }),
    )
    return histories
  }

  async confirmETHBalance(asset: AssetEntity): Promise<AssetEntity> {
    const transactions = await this.getEthHistory(
      asset,
      asset.transactions.length,
    )

    if (transactions.length > 0) {
      asset.transactions = transactions
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
          balance: prevBalance.toString(),
          timestamp: Math.floor(new Date(record.confirmed).getTime() / 1000),
        })
      }),
    )

    return allHistories
  }

  async confirmBTCBalance(asset: AssetEntity): Promise<AssetEntity> {
    const transactions = await this.getBtcHistory(
      asset,
      asset.transactions.length,
    )
    if (transactions.length > 0) {
      asset.transactions = transactions
      return asset
    }

    return null
  }

  // If there are missed transactions, they are added to history table
  async confirmWalletBalances(assets?: AssetEntity[]) {
    if (!assets) {
      assets = await this.getAllAssets()
    }
    const updatedAssets = await Promise.all(
      assets.map((asset: AssetEntity) => {
        if (
          asset.network === ENetworks.BITCOIN ||
          asset.network === ENetworks.BITCOIN_TEST
        ) {
          return this.confirmBTCBalance(asset)
        } else {
          return this.confirmETHBalance(asset)
        }
      }),
    )
    this.assetRepository.save(updatedAssets.filter((asset) => !!asset))
  }

  async createAsset(address: string, index: number, network: ENetworks) {
    if (network === ENetworks.ETHEREUM || network === ENetworks.ETHEREUM_TEST) {
      if (!isAddress(address)) {
        throw new BadRequestException('Invalid address')
      }
    }
    let asset

    asset = await this.assetRepository.findOne({ where: { address, network } })
    if (asset) {
      return asset.id
    }

    asset = this.addAsset(address, index, network)
    await this.portfolioService.updateCurrentWallets()
    this.portfolioService.fetchEthereumTransactions(network)

    return asset
  }

  async addAsset(
    address: string,
    index: number,
    network: ENetworks,
    walletEntity?: WalletEntity,
  ) {
    const prototype = new AssetEntity()
    prototype.wallets = walletEntity ? [walletEntity] : []
    prototype.address = address
    prototype.transactions = []
    prototype.index = index
    prototype.network = network

    const assetEntity = await this.assetRepository.save(prototype)

    let transactions
    try {
      if (
        network === ENetworks.ETHEREUM ||
        network === ENetworks.ETHEREUM_TEST
      ) {
        transactions = await this.getEthHistory(assetEntity, 0)
      } else {
        transactions = await this.getBtcHistory(assetEntity, 0)
      }
      assetEntity.transactions = transactions
    } catch (err) {
      Sentry.captureException(`addAsset(): ${err.message}`)
    }

    return await this.assetRepository.save(assetEntity)
  }

  //   async getAllAssetTransactions(): Promise<AssetEntity[]> {
  //     return await this.assetRepository.find({
  //       order: {
  //         transactions: {
  //           timestamp: 'DESC',
  //         },
  //       },
  //       relations: {
  //         wallets: {
  //           account: true,
  //         },
  //         transactions: true,
  //       },
  //     })
  //   }

  async updateHistory(
    updatedAsset: AssetEntity,
    tx: {
      transaction: { from: string; to: string; value: string; hash: string }
    },
    amount: BigNumber,
  ) {
    const transactions = updatedAsset.transactions
    const newHistoryData = {
      from: tx.transaction.from,
      to: tx.transaction.to,
      value: tx.transaction.value.toString(),
      hash: tx.transaction.hash,
      balance: transactions.length
        ? BigNumber.from(transactions[0].balance).sub(amount).toString()
        : BigNumber.from(tx.transaction.value).toString(),
      timestamp: this.portfolioService.getCurrentTimeBySeconds(),
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
    wallet?: WalletEntity,
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
          `${apiURL}}/api/v1/currencies/${currency}/accounts/discover?xpub=${xPub}`,
          {
            headers: { 'api-secret': apiKey },
          },
        ),
      )
      // return Promise.all(
      //   discoverResponse.data.data.map((addressInfo: IXPubInfo) => {
      const addressInfo = discoverResponse.data.data.find(
        (item: IXPubInfo) => item.index === index,
      )
      if (addressInfo) {
        Sentry.captureException(
          `addAssetFromXPub(): not found xPub address for index ${index}`,
        )
        throw new NotFoundException(`Not found address for index: ${index}`)
      }
      try {
        const asset = this.assetRepository.findOne({
          where: { address: addressInfo.address, network: network },
        })
        if (!asset) {
          this.addAsset(addressInfo.address, addressInfo.index, network, wallet)
          // this.addAsset({
          //   wallet,
          //   address: addressInfo.address,
          //   index: addressInfo.index,
          //   network,
          // })
        }
        return asset
      } catch (err) {
        Sentry.captureException(
          `${err.message}: ${addressInfo.address} in addAsset()`,
        )
      }
      //   }),
      // )
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
    }
  }

  getAsset(assetId: number) {
    return this.transactionRepository.findOne({
      where: {
        asset: {
          id: assetId,
        },
      },
      order: {
        timestamp: 'DESC',
      },
      relations: {
        asset: true,
      },
    })
  }

  async getAssetTransactions(
    assetId: number,
    accountId: number,
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
      // relations: {
      //   asset: {
      //     wallets: {
      //       account: true,
      //     },
      //   },
      // },
      order: {
        timestamp: 'DESC',
      },
      take: count,
      skip: start,
    })

    return transactions
  }

  async getAssetsByIds(assetIds: number[]) {
    return await this.assetRepository.find({
      where: { id: In(assetIds) },
    })
  }

  async getAssetPortfolio(accountId: number, assetId: number, period: EPeriod) {
    const periodAsNumber = period in SecondsIn ? SecondsIn[period] : null
    const timeInPast =
      period === EPeriod.All
        ? 0
        : this.portfolioService.getCurrentTimeBySeconds() - periodAsNumber || 0

    return this.assetRepository.findOne({
      where: {
        id: assetId,
        wallets: {
          account: {
            accountId: accountId,
          },
        },
        transactions: {
          timestamp: MoreThan(timeInPast),
        },
      },
      relations: {
        transactions: true,
      },
    })
  }

  async getNFTAssets(assetId: number, pageNumber: number) {
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
}
