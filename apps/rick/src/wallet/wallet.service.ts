import { IsNull, MoreThan, Not, Repository } from 'typeorm'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'
import {
  ETransactionStatuses,
  IBTCTransaction,
  SecondsIn,
} from './wallet.types'
import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { TransactionEntity } from './transaction.entity'
import { AddHistoryDto } from './dto/add-history.dto'
import { ENetworks, EPeriod, EWalletType } from '@rana/core'
import * as Sentry from '@sentry/node'
import { IVaultCoin } from './dto/add-xpubs'
import { AccountService } from '../account/account.service'
import { AssetEntity } from './asset.entity'
import { AssetService } from '../asset/asset.service'
import { PortfolioService } from '../portfolio/portfolio.service'

@Injectable()
export class WalletService {
  provider: ethers.providers.EtherscanProvider
  isProduction: boolean
  alchemyInstance
  princessAPIUrl: string
  liquidAPIKey: string
  liquidAPIUrl: string

  constructor(
    private configService: ConfigService,
    // private httpService: HttpService,
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly accountService: AccountService,
    private readonly assetService: AssetService,
    private readonly portfolioService: PortfolioService,
  ) {
    this.isProduction = this.configService.get<boolean>(
      EEnvironment.isProduction,
    )
    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )
    this.provider = new ethers.providers.EtherscanProvider(
      this.isProduction ? 'mainnet' : 'goerli',
      this.configService.get<string>(EEnvironment.etherscanAPIKey),
    )
    // this.confirmWalletBalances()

    // const alchemyKey = this.configService.get<string>(
    //   EEnvironment.alchemyAPIKey,
    // )
    // this.alchemyConfigure(this.isProduction, alchemyKey)

    this.liquidAPIKey = this.configService.get<string>(
      EEnvironment.liquidAPIKey,
    )
    this.liquidAPIUrl = this.configService.get<string>(
      EEnvironment.liquidAPIUrl,
    )
  }
  // alchemyConfigure(isProd: boolean, alchemyKey: string) {
  //   const settings = {
  //     apiKey: alchemyKey,
  //     network: isProd ? Network.ETH_MAINNET : Network.ETH_GOERLI,
  //   }

  //   this.alchemyInstance = new Alchemy(settings)
  // }

  // async getAllAddresses(): Promise<AssetEntity[]> {
  //   return await this.assetRepository.find({
  //     order: {
  //       transactions: {
  //         timestamp: 'DESC',
  //       },
  //     },
  //     relations: {
  //       wallets: {
  //         account: true,
  //       },
  //       transactions: true,
  //     },
  //   })
  // }

  // async getBtcHistory(
  //   transactions: IBTCTransaction[],
  //   asset: AssetEntity,
  //   balance: number,
  // ): Promise<TransactionEntity[]> {
  //   if (!transactions || transactions.length === 0) {
  //     return []
  //   }
  //   let currentBalance = balance
  //   const allHistories = await Promise.all(
  //     transactions.map((record) => {
  //       const prevBalance = currentBalance
  //       currentBalance = record.spent
  //         ? currentBalance - record.value
  //         : currentBalance + record.value
  //       return this.assetService.addHistory({
  //         asset: asset,
  //         from: record.spent ? asset.address : '',
  //         to: record.spent ? '' : asset.address,
  //         amount: record.value.toString(),
  //         hash: record.tx_hash,
  //         balance: prevBalance.toString(),
  //         timestamp: Math.floor(new Date(record.confirmed).getTime() / 1000),
  //         status: record.spent
  //           ? ETransactionStatuses.SENT
  //           : ETransactionStatuses.RECEIVED,
  //       })
  //     }),
  //   )

  //   return allHistories
  // }

  // async getEthHistory(
  //   transactions: ethers.providers.TransactionResponse[],
  //   asset: AssetEntity,
  // ): Promise<TransactionEntity[]> {
  //   const balance = await this.provider.getBalance(asset.address)

  //   let currentBalance = balance
  //   const histories = await Promise.all(
  //     transactions.reverse().map(async (record) => {
  //       const prevBalance = currentBalance
  //       const fee = record.gasLimit.mul(record.gasPrice)
  //       const walletAddress = asset.address.toLowerCase()

  //       if (record.from?.toLowerCase() === walletAddress) {
  //         currentBalance = currentBalance.add(fee)
  //         currentBalance = currentBalance.add(record.value)
  //       }
  //       //consider if transferred itself
  //       if (record.to?.toLowerCase() === walletAddress) {
  //         currentBalance = currentBalance.sub(record.value)
  //       }

  //       const newHistory: AddHistoryDto = {
  //         asset,
  //         from: record.from || '',
  //         to: record.to || '',
  //         hash: record.hash,
  //         amount: record.value.toString(),
  //         balance: prevBalance.toString(),
  //         timestamp: +record.timestamp,
  //       }
  //       // parse the transaction
  //       if (record.value.isZero()) {
  //         let iface = new ethers.utils.Interface(ERC721ABI)
  //         let response
  //         try {
  //           response = iface.parseTransaction({ data: record.data })
  //         } catch (err) {
  //           iface = new ethers.utils.Interface(ERC1155ABI)
  //           try {
  //             response = iface.parseTransaction({ data: record.data })
  //             // eslint-disable-next-line no-empty
  //           } catch (err) {}
  //         }
  //         // only track the transfer functions
  //         if (response && response.name.toLowerCase().includes('transfer')) {
  //           const { from, to, tokenId, id } = response.args
  //           newHistory.from = from || record.from
  //           newHistory.to = to
  //           newHistory.tokenId = tokenId?.toString() || id?.toString()
  //         }
  //       }

  //       return await this.addHistory(newHistory)
  //     }),
  //   )
  //   return histories
  // }

  async getUserWalletTransaction(
    accountId: string,
    walletId: string,
    start: number,
    count: number,
  ) {
    const transactions = await this.transactionRepository.find({
      where: {
        asset: {
          wallets: {
            id: walletId,
            account: {
              accountId: accountId,
            },
          },
        },
      },
      relations: {
        asset: {
          wallets: {
            account: true,
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

  async getWallet(accountId: string, walletId: string) {
    const wallet = await this.walletRepository.findOne({
      where: {
        id: walletId,
        account: {
          accountId: accountId,
        },
      },
      relations: {
        assets: true,
      },
    })

    return {
      id: wallet.id,
      title: wallet.title,
      mnemonic: wallet.mnemonic,
      assets: wallet.assets.map((asset) => asset.id),
    }
  }

  async getWallets(accountId: string) {
    const wallets = await this.walletRepository.find({
      where: {
        account: {
          accountId: accountId,
        },
        mnemonic: Not(IsNull()),
      },
      relations: { assets: true },
    })

    return wallets.map((wallet) => ({
      id: wallet.id,
      mnemonic: wallet.mnemonic,
      title: wallet.title,
      assets: wallet.assets.map((asset) => asset.id),
    }))
  }

  async updateWallet(
    walletId: string,
    accountId: string,
    title: string,
    mnemonic: string,
  ) {
    const wallet = await this.walletRepository.findOne({
      where: {
        id: walletId,
        account: {
          accountId: accountId,
        },
      },
    })

    if (wallet) {
      if (title !== undefined) {
        wallet.title = title
      } else {
        if (mnemonic) {
          wallet.mnemonic = mnemonic
        } else {
          wallet.mnemonic = null
        }
      }
      return this.walletRepository.save(wallet)
    } else {
      Sentry.captureException(
        `updateWallet(): walletId: ${walletId}, accountId: ${accountId}`,
      )
      throw new BadRequestException('Not found wallet')
    }
  }

  async deleteWallet(walletId: string, accountId: string) {
    await this.walletRepository.delete({
      id: walletId,
      account: {
        accountId: accountId,
      },
    })
  }

  // async lookUpByXPub(xPub: string): Promise<WalletEntity> {
  //   const response = await this.walletRepository.findOne({
  //     where: { xPub },
  //     relations: { accounts: true, assets: { transactions: true } },
  //   })

  //   return response
  // }

  // async lookUpByXPubs(xPubs: string[]): Promise<WalletEntity[]> {
  //   return await this.walletRepository.find({
  //     where: { xPub: In(xPubs) },
  //     relations: {
  //       assets: {
  //         transactions: true,
  //       },
  //     },
  //   })
  // }

  // async addNewWallet(
  //   accountId: number,
  //   xPub: string,
  //   walletType: EWalletType,
  //   title: string,
  // ): Promise<WalletEntity> {
  //   const account = await this.accountService.lookup({
  //     accountId,
  //   })
  //   if (!account) {
  //     throw new BadRequestException(`${accountId} not exists`)
  //   }

  //   const wallet = await this.lookUpByXPub(xPub)

  //   if (wallet) {
  //     if (wallet.type === walletType) {
  //       if (
  //         !wallet.accounts.map((account) => account.id).includes(account.id)
  //       ) {
  //         wallet.accounts.push(account)
  //       }
  //       return this.walletRepository.save(wallet)
  //     } else {
  //       throw new Error('The parameters are not matched with existing one')
  //     }
  //   } else {
  //     const prototype = new WalletEntity()
  //     prototype.xPub = xPub
  //     prototype.accounts = [account]
  //     prototype.type = walletType
  //     prototype.assets = []
  //     prototype.title = title

  //     let network
  //     if (walletType === EWalletType.METAMASK) {
  //       network = ENetworks.ETHEREUM
  //     } else if (walletType === EWalletType.HOTWALLET) {
  //       network = ENetworks.BITCOIN
  //     }
  //     const wallet = await this.walletRepository.save(prototype)

  //     if (walletType !== EWalletType.VAULT) {
  //       await this.createAsset({
  //         wallet,
  //         address: xPub,
  //         network: network,
  //         path:
  //           walletType === EWalletType.HOTWALLET
  //             ? IAddressPath.BTC
  //             : IAddressPath.ETH,
  //       })
  //     } else {
  //       await this.addAddressesFromXPub(wallet, xPub, ENetworks.ETHEREUM)
  //       await this.addAddressesFromXPub(wallet, xPub, ENetworks.BITCOIN)
  //     }
  //     this.fetchEthereumTransactions()
  //     return await this.lookUpByXPub(xPub)
  //   }
  // }
  async addNewWallet(
    accountId: string,
    title: string,
    mnemonic: string,
    assetIds: string[],
  ) {
    const account = await this.accountService.lookup({
      accountId,
    })
    if (!account) {
      throw new BadRequestException(`${accountId} not exists`)
    }

    // const wallet = await this.lookUpByXPub(xPub)

    // if (wallet) {
    //   if (wallet.type === walletType) {
    //     if (
    //       !wallet.accounts.map((account) => account.id).includes(account.id)
    //     ) {
    //       wallet.accounts.push(account)
    //     }
    //     return this.walletRepository.save(wallet)
    //   } else {
    //     throw new Error('The parameters are not matched with existing one')
    //   }
    // } else {

    const assets = await this.assetService.getAssetsByIds(assetIds)

    if (assets.length === 0) {
      throw new BadRequestException(
        `assetIds (${assetIds.toString()}) not exist`,
      )
    }

    if (assetIds.length !== assets.length) {
      const notExistAssetIds = assets
        .filter((asset) => !assetIds.includes(asset.id))
        .map((asset) => asset.id)

      throw new BadRequestException(
        `assetIds (${notExistAssetIds.toString()}) not exist`,
      )
    }

    try {
      const prototype = new WalletEntity()
      prototype.account = account
      prototype.title = title
      if (mnemonic) {
        prototype.mnemonic = mnemonic
      }
      prototype.assets = assets

      const wallet = await this.walletRepository.save(prototype)

      return {
        id: wallet.id,
        title,
        mnemonic,
        assets: assetIds,
      }
    } catch (err) {
      Sentry.captureException(`addNewWallet(): ${err.message}`)
      console.log(err)
      throw new InternalServerErrorException(
        'Something went wrong while saving wallet',
      )
    }

    // if (walletType !== EWalletType.VAULT) {
    //   await this.createAsset({
    //     wallet,
    //     address: xPub,
    //     network: network,
    //     path:
    //       walletType === EWalletType.HOTWALLET
    //         ? IAddressPath.BTC
    //         : IAddressPath.ETH,
    //   })
    // } else {
    //   await this.addAddressesFromXPub(wallet, xPub, ENetworks.ETHEREUM)
    //   await this.addAddressesFromXPub(wallet, xPub, ENetworks.BITCOIN)
    // }
    // this.fetchEthereumTransactions()
    // return await this.lookUpByXPub(xPub)
    // // }
  }

  // async addAddressesFromXPub(wallet, xPub, network: ENetworks) {
  //   try {
  //     const discoverResponse = await firstValueFrom(
  //       this.httpService.get(
  //         `${this.liquidAPIUrl}/api/v1/currencies/${
  //           network === ENetworks.ETHEREUM
  //             ? EXPubCurrency.ETHEREUM
  //             : EXPubCurrency.BITCOIN
  //         }/accounts/discover?xpub=${xPub}`,
  //         {
  //           headers: { 'api-secret': this.liquidAPIKey },
  //         },
  //       ),
  //     )
  //     return Promise.all(
  //       discoverResponse.data.data.map((addressInfo: IXPubInfo) => {
  //         try {
  //           const asset = this.assetRepository.findOne({
  //             where: { address: addressInfo.address, network: network },
  //           })
  //           if (!asset) {
  //             this.assetService.createAsset(
  //               addressInfo.address,
  //               addressInfo.index,
  //               network,
  //               wallet,
  //             )
  //             // this.createAsset({
  //             //   wallet,
  //             //   address: addressInfo.address,
  //             //   index: addressInfo.index,
  //             //   network,
  //             // })
  //           }
  //           return asset
  //         } catch (err) {
  //           Sentry.captureException(
  //             `${err.message}: ${addressInfo.address} in createAsset()`,
  //           )
  //         }
  //       }),
  //     )
  //   } catch (err) {
  //     if (err.response) {
  //       Sentry.captureException(
  //         `addAddressesFromXPub(): ${err.response.data.errors[0]}: ${xPub}`,
  //       )
  //     } else {
  //       Sentry.captureException(
  //         `addAddressesFromXPub(): ${err.message}: ${xPub}`,
  //       )
  //     }
  //   }
  // }

  // async createAsset(data: AddAddressDto): Promise<AssetEntity> {
  //   const prototype = new AssetEntity()
  //   prototype.wallets = [data.wallet]
  //   prototype.address = data.address
  //   prototype.transactions = []
  //   prototype.index = data.index
  //   prototype.network = data.network

  //   const address = await this.assetRepository.save(prototype)

  //   let transactions
  //   try {
  //     if (data.network === ENetworks.ETHEREUM) {
  //       const trxHistory = await this.provider.getHistory(address.address)
  //       transactions = await this.getEthHistory(trxHistory, address)
  //     } else {
  //       const txResponse: { data: IBTCTransactionResponse } =
  //         await firstValueFrom(
  //           this.httpService.get(
  //             `https://api.blockcypher.com/v1/btc/${
  //               this.isProduction ? 'main' : 'test3'
  //             }/addrs/${address.address}`,
  //           ),
  //         )
  //       transactions = await this.getBtcHistory(
  //         txResponse.data.txrefs,
  //         address,
  //         txResponse.data.balance,
  //       )
  //     }
  //     address.transactions = transactions
  //   } catch (err) {
  //     console.error(err)
  //     Sentry.captureException(`createAsset(): ${err.message}`)
  //   }

  //   return await this.assetRepository.save(address)
  // }

  updateWallets(wallets: WalletEntity[]) {
    return Promise.all(
      wallets.map((wallet) => this.walletRepository.save(wallet)),
    )
  }

  // updateAddress(address: AssetEntity) {
  //   return this.assetRepository.save(address)
  // }

  // async updateWalletActive(data: IWalletActiveData): Promise<WalletEntity> {
  //   const wallet = await this.walletRepository.findOne({
  //     where: {
  //       accounts: { accountId: data.accountId },
  //     },
  //     relations: {
  //       accounts: true,
  //     },
  //   })
  //   if (wallet.isActive === data.isActive) {
  //     return wallet
  //   }

  //   if (data.isActive) {
  //     // This wallet was inactive. so we need to add all missed transactions
  //     const addresses = wallet.assets

  //     this.confirmWalletBalances(addresses)
  //   }
  //   wallet.isActive = data.isActive
  //   return await this.walletRepository.save(wallet)
  // }

  // addHistory(data: AddHistoryDto) {
  //   return this.transactionRepository.save(data)
  // }

  async getUserWalletPortfolio(
    accountId: string,
    walletId: string,
    period: EPeriod,
  ) {
    const periodAsNumber = period in SecondsIn ? SecondsIn[period] : null
    const timeInPast =
      period === EPeriod.All
        ? 0
        : this.portfolioService.getCurrentTimeBySeconds() - periodAsNumber || 0

    const queryBuilder = this.walletRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.account', 'account')
      .leftJoinAndSelect('wallet.assets', 'assets')
      .leftJoinAndSelect(
        'assets.transactions',
        'assets.transactions',
        'assets.transactions.timestamp >= :start_at',
        {
          start_at: timeInPast,
        },
      )
      // .where('accounts.accountId IN (:...accounts)', { accounts: [accountId] })
      .where('account.id = :accountId', { accountId })
      .where('wallet.id = :walletId', { walletId })
      .orderBy('wallet.id', 'ASC')
      // .orderBy('assets.address', 'ASC')
      .orderBy('assets.transactions.timestamp', 'ASC')

    const wallet = await queryBuilder.getOne()

    if (!wallet) {
      Sentry.captureException(
        `getUserWalletPortfolio(): wallet(${walletId} not found with account(${accountId}))`,
      )
      throw new BadRequestException(`Wallet not found(${walletId})`)
    }

    return wallet.assets
  }

  // async getUserHistory(accountId: number, period: EPeriod) {
  //   return this._getWalletHistory(accountId, period)
  // }

  // async getUserWalletHistory(
  //   accountId: number,
  //   walletId: number,
  //   period: EPeriod,
  // ) {
  //   return this._getWalletHistory(accountId, period, walletId)
  // }

  // async confirmETHBalance(asset: AssetEntity): Promise<AssetEntity> {
  //   const trxHistory = await this.provider.getHistory(asset.address)

  //   if (trxHistory && trxHistory.length > asset.transactions.length) {
  //     asset.transactions = await this.getEthHistory(
  //       trxHistory.slice(asset.transactions.length, trxHistory.length),
  //       asset,
  //     )
  //     return asset
  //   } else {
  //     return null
  //   }
  // }
  // async confirmBTCBalance(address: AssetEntity): Promise<AssetEntity> {
  //   const txResponse: { data: IBTCTransactionResponse } = await firstValueFrom(
  //     this.httpService.get(
  //       `https://api.blockcypher.com/v1/btc/${
  //         this.isProduction ? 'main' : 'test3'
  //       }/addrs/${address.address}`,
  //     ),
  //   )

  //   const trxHistory = txResponse.data.txrefs
  //   if (trxHistory && trxHistory.length > address.transactions.length) {
  //     address.transactions = await this.getBtcHistory(
  //       trxHistory.slice(address.transactions.length, trxHistory.length),
  //       address,
  //       txResponse.data.balance,
  //     )
  //     return address
  //   } else {
  //     return null
  //   }
  // }

  // // If there are missed transactions, they are added to history table
  // async confirmWalletBalances(addresses?: AssetEntity[]) {
  //   if (!addresses) {
  //     addresses = await this.getAllAddresses()
  //   }
  //   const updatedAddresses = await Promise.all(
  //     addresses.map((address: AssetEntity) => {
  //       if (address.network === ENetworks.BITCOIN) {
  //         return this.confirmBTCBalance(address)
  //       } else {
  //         return this.confirmETHBalance(address)
  //       }
  //     }),
  //   )
  //   this.walletRepository.save(updatedAddresses.filter((address) => !!address))
  // }

  // async updateHistory(
  //   updatedAsset: AssetEntity,
  //   tx: {
  //     transaction: { from: string; to: string; value: string; hash: string }
  //   },
  //   amount: BigNumber,
  // ) {
  //   const transactions = updatedAsset.transactions
  //   const newHistoryData = {
  //     from: tx.transaction.from,
  //     to: tx.transaction.to,
  //     value: tx.transaction.value.toString(),
  //     hash: tx.transaction.hash,
  //     balance: transactions.length
  //       ? BigNumber.from(transactions[0].balance).sub(amount).toString()
  //       : BigNumber.from(tx.transaction.value).toString(),
  //     timestamp: this.getCurrentTimeBySeconds(),
  //   }

  //   let newHistory
  //   try {
  //     newHistory = await this.addHistory({
  //       asset: updatedAsset,
  //       ...newHistoryData,
  //     })
  //   } catch (err) {
  //     Sentry.captureException(
  //       `${err.message} + " in updateHistory(address: ${updatedAsset.address}, hash: ${tx.transaction.hash}`,
  //     )
  //     return
  //   }

  //   transactions.push(newHistory)
  //   updatedAsset.transactions = transactions

  //   const postUpdatedAddress = {
  //     assetId: updatedAsset.id,
  //     walletIds: updatedAsset.wallets.map((wallet) => wallet.id),
  //     accountId: updatedAsset.wallets.map((wallet) => wallet.account.id),
  //     newHistory: newHistoryData,
  //   }

  //   firstValueFrom(
  //     this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
  //       type: EPortfolioType.TRANSACTION,
  //       data: [postUpdatedAddress],
  //     }),
  //   ).catch(() => {
  //     Sentry.captureException(
  //       'Princess portfolio/updated api error in fetchEthereumTransactions()',
  //     )
  //   })
  // }

  // subscribeEthereumTransactions(addresses: AssetEntity[]) {
  //   let sourceAddresses: { from?: string; to?: string }[] = addresses.map(
  //     (address) => ({
  //       from: address.address,
  //     }),
  //   )

  //   sourceAddresses = sourceAddresses.concat(
  //     addresses.map((address) => ({
  //       to: address.address,
  //     })),
  //   )
  //   const currentAddresses = addresses.map((address) =>
  //     address.address.toLowerCase(),
  //   )

  //   this.alchemyInstance.ws.on(
  //     {
  //       method: AlchemySubscription.MINED_TRANSACTIONS,
  //       addresses: sourceAddresses,
  //       includeRemoved: true,
  //       hashesOnly: false,
  //     },
  //     (tx) => {
  //       try {
  //         if (currentAddresses.includes(tx.transaction.from.toLowerCase())) {
  //           const fee = BigNumber.from(tx.transaction.gasPrice).mul(
  //             BigNumber.from(tx.transaction.gas),
  //           )
  //           const amount = BigNumber.from(tx.transaction.value).add(fee)
  //           const updatedAddress = addresses.find(
  //             (address) =>
  //               address.address.toLowerCase() ===
  //               tx.transaction.from.toLowerCase(),
  //           )
  //           this.updateHistory(updatedAddress, tx, amount)
  //         }

  //         if (currentAddresses.includes(tx.transaction.to.toLowerCase())) {
  //           const amount = BigNumber.from(0).sub(
  //             BigNumber.from(tx.transaction.value),
  //           )
  //           const updatedAddress = addresses.find(
  //             (address) =>
  //               address.address.toLowerCase() ===
  //               tx.transaction.to.toLowerCase(),
  //           )
  //           this.updateHistory(updatedAddress, tx, amount)
  //         }
  //       } catch (err) {
  //         Sentry.captureException(
  //           `${err.message} in subscribeEthereumTransactions: (${tx}) `,
  //         )
  //       }
  //     },
  //   )
  // }

  // async fetchEthereumTransactions() {
  //   const addresses = await this.getAllAddresses()

  //   const activeEthAddresses = addresses.filter(
  //     (address) => address.network === ENetworks.ETHEREUM,
  //   )
  //   if (activeEthAddresses.length === 0) return

  //   this.alchemyInstance.ws.removeAllListeners()

  //   this.subscribeEthereumTransactions(activeEthAddresses)
  // }

  // async addAssetFromXPub(
  //   wallet: WalletEntity,
  //   xPub: string,
  //   xpubType: ExPubTypes,
  // ): Promise<WalletEntity> {
  //   const wallet = await this.lookUpByXPub(xPub)
  //   if (wallet) {
  //     if (!wallet.accounts.map((account) => account.id).includes(account.id)) {
  //       wallet.accounts.push(account)
  //     }
  //     return this.walletRepository.save(wallet)
  //   } else {
  //     const prototype = new WalletEntity()
  //     prototype.xPub = xPub
  //     prototype.accounts = [account]
  //     prototype.type = walletType
  //     prototype.assets = []

  //     const wallet = await this.walletRepository.save(prototype)

  //     await this.addAddressesFromXPub(wallet, xPub, ENetworks.ETHEREUM)
  //     await this.addAddressesFromXPub(wallet, xPub, ENetworks.BITCOIN)

  //     return wallet
  //   }
  // }

  async addVaultCoins(title: string, accountId: string, coins: IVaultCoin[]) {
    const account = await this.accountService.lookup({
      accountId: accountId,
    })
    if (!account) {
      throw new BadRequestException(`${accountId} not exists`)
    }

    try {
      const prototype = new WalletEntity()
      prototype.account = account
      prototype.title = title
      prototype.assets = []
      const walletEntity = await this.walletRepository.save(prototype)

      await Promise.all(
        coins.map(async (coin) => {
          try {
            const network =
              coin.BIP44 === 0 ? ENetworks.BITCOIN : ENetworks.ETHEREUM
            Promise.all(
              coin.wallets.map(async (wallet) => {
                return await this.assetService.addAsset(
                  wallet.address,
                  wallet.index,
                  network,
                  walletEntity,
                )
              }),
            )
            // return await this.assetService.addAssetFromXPub(
            //   xpub.xpub,
            //   0,
            //   xpub.type === ExPubTypes.BIP44
            //     ? ENetworks.ETHEREUM
            //     : ENetworks.BITCOIN,
            //   wallet,
            // )
            // eslint-disable-next-line no-empty
          } catch (err) {}
        }),
      )
      await this.portfolioService.updateCurrentWallets()
      this.portfolioService.fetchEthereumTransactions(ENetworks.ETHEREUM)
      this.portfolioService.fetchEthereumTransactions(ENetworks.ETHEREUM_TEST)

      const newWallet = await this.getWallet(accountId, walletEntity.id)
      return newWallet
    } catch (e) {
      Sentry.captureException(e.message + ' while addNewWallet')

      throw new BadRequestException(e.message)
    }
  }

  async combineWallets(existingAccountId: string, anonymousId: string) {
    const existingAccount = await this.accountService.lookup({
      accountId: existingAccountId,
    })
    const wallets = await this.walletRepository.find({
      where: {
        account: { accountId: anonymousId },
        mnemonic: Not(IsNull()),
      },
      relations: {
        account: true,
      },
    })
    wallets.map((wallet) => {
      wallet.account = existingAccount
    })

    await this.updateWallets(wallets)

    const resultWallets = await this.walletRepository.find({
      where: { account: { accountId: existingAccountId } },
    })

    return resultWallets
  }
}
