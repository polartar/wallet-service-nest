import { MoreThanOrEqual, Repository } from 'typeorm'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'
import {
  EXPubCurrency,
  IAddressPath,
  IBTCTransaction,
  IBTCTransactionResponse,
  IXPubInfo,
  SecondsIn,
} from './wallet.types'
import { BigNumber, ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { HistoryEntity } from './history.entity'
import { AddAddressDto } from './dto/add-address.dto'
import { AddressEntity } from './address.entity'
import { AddHistoryDto } from './dto/add-history.dto'
import { ECoinType, EPeriod, EPortfolioType, EWalletType } from '@rana/core'
import { IWalletActiveData } from '../portfolio/portfolio.types'
import * as Sentry from '@sentry/node'
import { Alchemy, AlchemySubscription, Network } from 'alchemy-sdk'
import { IXPub } from './dto/add-xpubs'
import { AccountService } from '../account/account.service'
import { AccountEntity } from '../account/account.entity'

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
    private httpService: HttpService,
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(HistoryEntity)
    private readonly historyRepository: Repository<HistoryEntity>,
    private readonly accountService: AccountService,
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
    this.confirmWalletBalances()

    const alchemyKey = this.configService.get<string>(
      EEnvironment.alchemyAPIKey,
    )
    this.alchemyConfigure(this.isProduction, alchemyKey)

    this.liquidAPIKey = this.configService.get<string>(
      EEnvironment.liquidAPIKey,
    )
    this.liquidAPIUrl = this.configService.get<string>(
      EEnvironment.liquidAPIUrl,
    )
  }
  alchemyConfigure(isProd: boolean, alchemyKey: string) {
    const settings = {
      apiKey: alchemyKey,
      network: isProd ? Network.ETH_MAINNET : Network.ETH_GOERLI,
    }

    this.alchemyInstance = new Alchemy(settings)
  }

  getCurrentTimeBySeconds() {
    return Math.floor(Date.now() / 1000)
  }

  async getAllAddresses(): Promise<AddressEntity[]> {
    return await this.addressRepository.find({
      order: {
        history: {
          timestamp: 'DESC',
        },
      },
      relations: {
        wallet: {
          accounts: true,
        },
        history: true,
      },
    })
  }

  async generateBTCHistories(
    transactions: IBTCTransaction[],
    address: AddressEntity,
    balance: number,
  ): Promise<HistoryEntity[]> {
    let currentBalance = balance
    const allHistories = await Promise.all(
      transactions.map((record) => {
        const prevBalance = currentBalance
        currentBalance = record.spent
          ? currentBalance - record.value
          : currentBalance + record.value
        return this.addHistory({
          address: address,
          from: record.spent ? address.address : '',
          to: record.spent ? '' : address.address,
          amount: record.value.toString(),
          hash: record.tx_hash,
          balance: prevBalance.toString(),
          timestamp: Math.floor(new Date(record.confirmed).getTime() / 1000),
        })
      }),
    )

    return allHistories
  }

  async generateEthHistories(
    transactions: ethers.providers.TransactionResponse[],
    address: AddressEntity,
  ): Promise<HistoryEntity[]> {
    const balance = await this.provider.getBalance(address.address)

    let currentBalance = balance
    const histories = await Promise.all(
      transactions.reverse().map((record) => {
        const prevBalance = currentBalance
        const fee = record.gasLimit.mul(record.gasPrice)
        const walletAddress = address.address.toLowerCase()

        if (record.from?.toLowerCase() === walletAddress) {
          currentBalance = currentBalance.add(fee)
          currentBalance = currentBalance.add(record.value)
        }
        //consider if transferred itself
        if (record.to?.toLowerCase() === walletAddress) {
          currentBalance = currentBalance.sub(record.value)
        }

        return this.addHistory({
          address,
          from: record.from || '',
          to: record.to || '',
          hash: record.hash,
          amount: record.value.toString(),
          balance: prevBalance.toString(),
          timestamp: record.timestamp,
        })
      }),
    )
    return histories
  }

  async lookUpByXPub(xPub: string): Promise<WalletEntity> {
    return await this.walletRepository.findOne({
      where: { xPub },
      relations: { accounts: true },
    })
  }

  async addNewWallet(
    accountId: number,
    xPub: string,
    walletType: EWalletType,
  ): Promise<WalletEntity> {
    const account = await this.accountService.lookup({
      accountId,
    })
    if (!account) {
      throw new BadRequestException(`${accountId} not exists`)
    }

    const wallet = await this.lookUpByXPub(xPub)

    if (wallet) {
      if (wallet.type === walletType) {
        if (
          !wallet.accounts.map((account) => account.id).includes(account.id)
        ) {
          wallet.accounts.push(account)
        }
        return this.walletRepository.save(wallet)
      } else {
        throw new Error('The parameters are not matched with existing one')
      }
    } else {
      const prototype = new WalletEntity()
      prototype.xPub = xPub
      prototype.accounts = [account]
      prototype.type = walletType
      prototype.addresses = []

      let coinType
      if (walletType === EWalletType.METAMASK) {
        coinType = ECoinType.ETHEREUM
      } else if (walletType === EWalletType.VAULT) {
        coinType = ECoinType.BITCOIN
      }
      const wallet = await this.walletRepository.save(prototype)

      if (walletType !== EWalletType.HOTWALLET) {
        await this.addNewAddress({
          wallet,
          address: xPub,
          coinType: coinType,
          path:
            walletType === EWalletType.VAULT
              ? IAddressPath.BTC
              : IAddressPath.ETH,
        })
      } else {
        await this.addAddressesFromXPub(wallet, xPub, ECoinType.ETHEREUM)
        await this.addAddressesFromXPub(wallet, xPub, ECoinType.BITCOIN)
      }
      this.runEthereumService()
      return wallet
    }
  }

  async addAddressesFromXPub(wallet, xPub, coinType: ECoinType) {
    let discoverResponse
    try {
      discoverResponse = await firstValueFrom(
        this.httpService.get(
          `${this.liquidAPIUrl}/api/v1/currencies/${
            coinType === ECoinType.ETHEREUM
              ? EXPubCurrency.ETHEREUM
              : EXPubCurrency.BITCOIN
          }/accounts/discover?xpub=${xPub}`,
          {
            headers: { 'api-secret': this.liquidAPIKey },
          },
        ),
      )
    } catch (err) {
      Sentry.captureException(`${err.message}: ${xPub} in addAddressesFromXPub`)
      throw new BadRequestException(err.message)
    }
    return Promise.all(
      discoverResponse.data.data.map((addressInfo: IXPubInfo) => {
        try {
          return this.addNewAddress({
            wallet,
            address:
              coinType === ECoinType.ETHEREUM
                ? addressInfo.address
                : addressInfo.address?.split(':')[1],
            path: addressInfo.path,
            coinType,
          })
        } catch (err) {
          Sentry.captureException(
            `${err.message}: ${addressInfo.address} in addNewAddress`,
          )
        }
      }),
    )
  }

  async addNewAddress(data: AddAddressDto): Promise<AddressEntity> {
    const prototype = new AddressEntity()
    prototype.wallet = data.wallet
    prototype.address = data.address
    prototype.history = []
    prototype.path = data.path
    prototype.coinType = data.coinType

    const address = await this.addressRepository.save(prototype)

    let allHistories
    try {
      if (data.coinType === ECoinType.ETHEREUM) {
        const trxHistory = await this.provider.getHistory(address.address)
        allHistories = await this.generateEthHistories(trxHistory, address)
      } else {
        const txResponse: { data: IBTCTransactionResponse } =
          await firstValueFrom(
            this.httpService.get(
              `https://api.blockcypher.com/v1/btc/${
                this.isProduction ? 'main' : 'test3'
              }/addrs/${address.address}`,
            ),
          )
        allHistories = await this.generateBTCHistories(
          txResponse.data.txrefs,
          address,
          txResponse.data.balance,
        )
      }
      address.history = allHistories
    } catch (err) {
      Sentry.captureException(err.message + ' in addNewAddress')

      throw new BadRequestException(err.message)
    }

    return await this.addressRepository.save(address)
  }

  updateWallets(wallets: WalletEntity[]) {
    return Promise.all(
      wallets.map((wallet) => this.walletRepository.save(wallet)),
    )
  }

  updateAddress(address: AddressEntity) {
    return this.addressRepository.save(address)
  }

  async updateWalletsActive(data: IWalletActiveData): Promise<WalletEntity> {
    const wallet = await this.walletRepository.findOne({
      where: {
        accounts: { accountId: data.accountId },
      },
      relations: {
        accounts: true,
      },
    })
    if (wallet.isActive === data.isActive) {
      return wallet
    }

    if (data.isActive) {
      // This wallet was inactive. so we need to add all missed transactions
      const addresses = wallet.addresses

      this.confirmWalletBalances(addresses)
    }
    wallet.isActive = data.isActive
    return await this.walletRepository.save(wallet)
  }

  addHistory(data: AddHistoryDto) {
    return this.historyRepository.save(data)
  }

  async _getWalletHistory(
    accountId: number,
    period: EPeriod,
    walletId?: number,
  ) {
    const periodAsNumber = period in SecondsIn ? SecondsIn[period] : null
    const timeInPast = this.getCurrentTimeBySeconds() - periodAsNumber || 0

    return this.walletRepository.find({
      where: {
        isActive: true,
        accounts: { accountId },
        id: walletId,
        addresses: {
          history:
            periodAsNumber === null
              ? null
              : {
                  timestamp: MoreThanOrEqual(timeInPast),
                },
        },
      },
      order: {
        addresses: {
          history: {
            timestamp: 'DESC',
          },
        },
      },
      relations: {
        accounts: true,
        addresses: {
          history: true,
        },
      },
    })
  }

  async getUserHistory(accountId: number, period: EPeriod) {
    return this._getWalletHistory(accountId, period)
  }

  async getUserWalletHistory(
    accountId: number,
    walletId: number,
    period: EPeriod,
  ) {
    return this._getWalletHistory(accountId, period, walletId)
  }
  async confirmETHBalance(address: AddressEntity): Promise<AddressEntity> {
    const trxHistory = await this.provider.getHistory(address.address)

    if (trxHistory.length > address.history.length) {
      address.history = await this.generateEthHistories(
        trxHistory.slice(address.history.length, trxHistory.length),
        address,
      )
      return address
    } else {
      return null
    }
  }
  async confirmBTCBalance(address: AddressEntity): Promise<AddressEntity> {
    const txResponse: { data: IBTCTransactionResponse } = await firstValueFrom(
      this.httpService.get(
        `https://api.blockcypher.com/v1/btc/${
          this.isProduction ? 'main' : 'test3'
        }/addrs/${address.address}`,
      ),
    )

    const trxHistory = txResponse.data.txrefs
    if (trxHistory.length > address.history.length) {
      address.history = await this.generateBTCHistories(
        trxHistory.slice(address.history.length, trxHistory.length),
        address,
        txResponse.data.balance,
      )
      return address
    } else {
      return null
    }
  }

  // If there are missed transactions, they are added to history table
  async confirmWalletBalances(addresses?: AddressEntity[]) {
    if (!addresses) {
      addresses = await this.getAllAddresses()
    }
    const updatedAddresses = await Promise.all(
      addresses.map((address: AddressEntity) => {
        if (address.path === IAddressPath.BTC) {
          return this.confirmBTCBalance(address)
        } else {
          return this.confirmETHBalance(address)
        }
      }),
    )
    this.walletRepository.save(updatedAddresses.filter((address) => !!address))
  }

  async updateHistory(
    updatedAddress: AddressEntity,
    tx: {
      transaction: { from: string; to: string; value: string; hash: string }
    },
    amount: BigNumber,
  ) {
    const history = updatedAddress.history
    const newHistoryData = {
      from: tx.transaction.from,
      to: tx.transaction.to,
      amount: tx.transaction.value.toString(),
      hash: tx.transaction.hash,
      balance: history.length
        ? BigNumber.from(history[0].balance).sub(amount).toString()
        : BigNumber.from(tx.transaction.value).toString(),
      timestamp: this.getCurrentTimeBySeconds(),
    }

    let newHistory
    try {
      newHistory = await this.addHistory({
        address: updatedAddress,
        ...newHistoryData,
      })
    } catch (err) {
      Sentry.captureException(
        `${err.message} + " in updateHistory(address: ${updatedAddress.address}, hash: ${tx.transaction.hash}`,
      )
      return
    }

    history.push(newHistory)
    updatedAddress.history = history

    const postUpdatedAddress = {
      addressId: updatedAddress.id,
      walletId: updatedAddress.wallet.id,
      accountIds: updatedAddress.wallet.accounts.map(
        (account) => account.accountId,
      ),
      newHistory: newHistoryData,
    }

    firstValueFrom(
      this.httpService.post(`${this.princessAPIUrl}/portfolio/updated`, {
        type: EPortfolioType.TRANSACTION,
        data: [postUpdatedAddress],
      }),
    ).catch(() => {
      Sentry.captureException(
        'Princess portfolio/updated api error in runEthereumService()',
      )
    })
  }

  subscribeEthereumTransactions(addresses: AddressEntity[]) {
    let sourceAddresses: { from?: string; to?: string }[] = addresses.map(
      (address) => ({
        from: address.address,
      }),
    )

    sourceAddresses = sourceAddresses.concat(
      addresses.map((address) => ({
        to: address.address,
      })),
    )
    const currentAddresses = addresses.map((address) =>
      address.address.toLowerCase(),
    )

    this.alchemyInstance.ws.on(
      {
        method: AlchemySubscription.MINED_TRANSACTIONS,
        addresses: sourceAddresses,
        includeRemoved: true,
        hashesOnly: false,
      },
      (tx) => {
        try {
          if (currentAddresses.includes(tx.transaction.from.toLowerCase())) {
            const fee = BigNumber.from(tx.transaction.gasPrice).mul(
              BigNumber.from(tx.transaction.gas),
            )
            const amount = BigNumber.from(tx.transaction.value).add(fee)
            const updatedAddress = addresses.find(
              (address) =>
                address.address.toLowerCase() ===
                tx.transaction.from.toLowerCase(),
            )
            this.updateHistory(updatedAddress, tx, amount)
          }

          if (currentAddresses.includes(tx.transaction.to.toLowerCase())) {
            const amount = BigNumber.from(0).sub(
              BigNumber.from(tx.transaction.value),
            )
            const updatedAddress = addresses.find(
              (address) =>
                address.address.toLowerCase() ===
                tx.transaction.to.toLowerCase(),
            )
            this.updateHistory(updatedAddress, tx, amount)
          }
        } catch (err) {
          Sentry.captureException(
            `${err.message} in subscribeEthereumTransactions: (${tx}) `,
          )
        }
      },
    )
  }

  async runEthereumService() {
    let addresses = await this.getAllAddresses()
    addresses = addresses.filter((address) => address.wallet.isActive)

    const activeEthAddresses = addresses.filter(
      (address) => address.coinType === ECoinType.ETHEREUM,
    )
    if (activeEthAddresses.length === 0) return

    this.alchemyInstance.ws.removeAllListeners()

    this.subscribeEthereumTransactions(activeEthAddresses)
  }

  async addXPub(
    account: AccountEntity,
    xPub: string,
    walletType: EWalletType,
  ): Promise<WalletEntity> {
    const wallet = await this.lookUpByXPub(xPub)

    if (wallet) {
      if (!wallet.accounts.map((account) => account.id).includes(account.id)) {
        wallet.accounts.push(account)
      }
      return this.walletRepository.save(wallet)
    } else {
      const prototype = new WalletEntity()
      prototype.xPub = xPub
      prototype.accounts = [account]
      prototype.type = walletType
      prototype.addresses = []

      const wallet = await this.walletRepository.save(prototype)

      await this.addAddressesFromXPub(wallet, xPub, ECoinType.ETHEREUM)
      await this.addAddressesFromXPub(wallet, xPub, ECoinType.BITCOIN)

      return wallet
    }
  }

  async addXPubs(accountId: number, xpubs: IXPub[]) {
    const account = await this.accountService.lookup({
      accountId: accountId,
    })
    if (!account) {
      throw new BadRequestException(`${accountId} not exists`)
    }

    try {
      const newWallets = await Promise.all(
        xpubs.map((xpub) => {
          return this.addXPub(account, xpub.xpub, EWalletType.HOTWALLET)
        }),
      )
      this.runEthereumService()

      return newWallets
    } catch (e) {
      Sentry.captureException(e.message + ' while addNewWallet')

      throw new BadRequestException(e.message)
    }
  }
}
