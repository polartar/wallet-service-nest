import { In, Repository } from 'typeorm'
import { BadRequestException, Injectable } from '@nestjs/common'
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
import { TransactionEntity } from './transaction.entity'
import { AddAddressDto } from './dto/add-address.dto'
import { AddHistoryDto } from './dto/add-history.dto'
import { ENetworks, EPeriod, EPortfolioType, EWalletType } from '@rana/core'
import { IWalletActiveData } from '../portfolio/portfolio.types'
import * as Sentry from '@sentry/node'
import { Alchemy, AlchemySubscription, Network } from 'alchemy-sdk'
import { IXPub } from './dto/add-xpubs'
import { AccountService } from '../account/account.service'
import { AccountEntity } from '../account/account.entity'
import ERC721ABI from './abis/erc721'
import ERC1155ABI from './abis/erc1155'
import { AssetEntity } from './asset.entity'

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
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @InjectRepository(TransactionEntity)
    private readonly historyRepository: Repository<TransactionEntity>,
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

  async getAllAddresses(): Promise<AssetEntity[]> {
    return await this.assetRepository.find({
      order: {
        transactions: {
          timestamp: 'DESC',
        },
      },
      relations: {
        wallet: {
          accounts: true,
        },
        transactions: true,
      },
    })
  }

  async getBtcHistory(
    transactions: IBTCTransaction[],
    asset: AssetEntity,
    balance: number,
  ): Promise<TransactionEntity[]> {
    if (!transactions || transactions.length === 0) {
      return []
    }
    let currentBalance = balance
    const allHistories = await Promise.all(
      transactions.map((record) => {
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

  async getEthHistory(
    transactions: ethers.providers.TransactionResponse[],
    asset: AssetEntity,
  ): Promise<TransactionEntity[]> {
    const balance = await this.provider.getBalance(asset.address)

    let currentBalance = balance
    const histories = await Promise.all(
      transactions.reverse().map(async (record) => {
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

        const newHistory: AddHistoryDto = {
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

  async lookUpByXPub(xPub: string): Promise<WalletEntity> {
    const response = await this.walletRepository.findOne({
      where: { xPub },
      relations: { accounts: true, assets: { transactions: true } },
    })

    return response
  }

  async lookUpByXPubs(xPubs: string[]): Promise<WalletEntity[]> {
    return await this.walletRepository.find({
      where: { xPub: In(xPubs) },
      relations: {
        assets: {
          transactions: true,
        },
      },
    })
  }

  async addNewWallet(
    accountId: number,
    xPub: string,
    walletType: EWalletType,
    title: string,
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
      prototype.assets = []
      prototype.title = title

      let network
      if (walletType === EWalletType.METAMASK) {
        network = ENetworks.ETHEREUM
      } else if (walletType === EWalletType.HOTWALLET) {
        network = ENetworks.BITCOIN
      }
      const wallet = await this.walletRepository.save(prototype)

      if (walletType !== EWalletType.VAULT) {
        await this.createAddress({
          wallet,
          address: xPub,
          network: network,
          path:
            walletType === EWalletType.HOTWALLET
              ? IAddressPath.BTC
              : IAddressPath.ETH,
        })
      } else {
        await this.addAddressesFromXPub(wallet, xPub, ENetworks.ETHEREUM)
        await this.addAddressesFromXPub(wallet, xPub, ENetworks.BITCOIN)
      }
      this.fetchEthereumTransactions()
      return await this.lookUpByXPub(xPub)
    }
  }

  async addAddressesFromXPub(wallet, xPub, network: ENetworks) {
    try {
      const discoverResponse = await firstValueFrom(
        this.httpService.get(
          `${this.liquidAPIUrl}/api/v1/currencies/${
            network === ENetworks.ETHEREUM
              ? EXPubCurrency.ETHEREUM
              : EXPubCurrency.BITCOIN
          }/accounts/discover?xpub=${xPub}`,
          {
            headers: { 'api-secret': this.liquidAPIKey },
          },
        ),
      )
      return Promise.all(
        discoverResponse.data.data.map((addressInfo: IXPubInfo) => {
          try {
            return this.createAddress({
              wallet,
              address: addressInfo.address,
              path: addressInfo.path,
              network,
            })
          } catch (err) {
            Sentry.captureException(
              `${err.message}: ${addressInfo.address} in createAddress()`,
            )
          }
        }),
      )
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

  async createAddress(data: AddAddressDto): Promise<AssetEntity> {
    const prototype = new AssetEntity()
    prototype.wallet = data.wallet
    prototype.address = data.address
    prototype.transactions = []
    prototype.path = data.path
    prototype.network = data.network

    const address = await this.assetRepository.save(prototype)

    let allHistories
    try {
      if (data.network === ENetworks.ETHEREUM) {
        const trxHistory = await this.provider.getHistory(address.address)
        allHistories = await this.getEthHistory(trxHistory, address)
      } else {
        const txResponse: { data: IBTCTransactionResponse } =
          await firstValueFrom(
            this.httpService.get(
              `https://api.blockcypher.com/v1/btc/${
                this.isProduction ? 'main' : 'test3'
              }/addrs/${address.address}`,
            ),
          )
        allHistories = await this.getBtcHistory(
          txResponse.data.txrefs,
          address,
          txResponse.data.balance,
        )
      }
      address.transactions = allHistories
    } catch (err) {
      console.error(err)
      Sentry.captureException(`createAddress(): ${err.message}`)
    }

    return await this.assetRepository.save(address)
  }

  updateWallets(wallets: WalletEntity[]) {
    return Promise.all(
      wallets.map((wallet) => this.walletRepository.save(wallet)),
    )
  }

  updateAddress(address: AssetEntity) {
    return this.assetRepository.save(address)
  }

  async updateWalletActive(data: IWalletActiveData): Promise<WalletEntity> {
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
      const addresses = wallet.assets

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
    const timeInPast =
      period === EPeriod.All
        ? 0
        : this.getCurrentTimeBySeconds() - periodAsNumber || 0

    const queryBuilder = this.walletRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.accounts', 'accounts')
      .leftJoinAndSelect('wallet.addresses', 'addresses')
      .leftJoinAndSelect(
        'addresses.history',
        'addresses.history',
        'addresses.history.timestamp >= :start_at',
        {
          start_at: timeInPast,
        },
      )
      .where('accounts.accountId IN (:...accounts)', { accounts: [accountId] })
      .orderBy('wallet.id', 'ASC')
      .orderBy('addresses.address', 'ASC')
      .orderBy('addresses.history.timestamp', 'DESC')

    if (walletId) {
      queryBuilder.andWhere('wallet.id = :id', { id: walletId })
    }

    return await queryBuilder.getMany()
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
  async confirmETHBalance(asset: AssetEntity): Promise<AssetEntity> {
    const trxHistory = await this.provider.getHistory(asset.address)

    if (trxHistory && trxHistory.length > asset.transactions.length) {
      asset.transactions = await this.getEthHistory(
        trxHistory.slice(asset.transactions.length, trxHistory.length),
        asset,
      )
      return asset
    } else {
      return null
    }
  }
  async confirmBTCBalance(address: AssetEntity): Promise<AssetEntity> {
    const txResponse: { data: IBTCTransactionResponse } = await firstValueFrom(
      this.httpService.get(
        `https://api.blockcypher.com/v1/btc/${
          this.isProduction ? 'main' : 'test3'
        }/addrs/${address.address}`,
      ),
    )

    const trxHistory = txResponse.data.txrefs
    if (trxHistory && trxHistory.length > address.transactions.length) {
      address.transactions = await this.getBtcHistory(
        trxHistory.slice(address.transactions.length, trxHistory.length),
        address,
        txResponse.data.balance,
      )
      return address
    } else {
      return null
    }
  }

  // If there are missed transactions, they are added to history table
  async confirmWalletBalances(addresses?: AssetEntity[]) {
    if (!addresses) {
      addresses = await this.getAllAddresses()
    }
    const updatedAddresses = await Promise.all(
      addresses.map((address: AssetEntity) => {
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
      timestamp: this.getCurrentTimeBySeconds(),
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
      addressId: updatedAsset.id,
      walletId: updatedAsset.wallet.id,
      accountIds: updatedAsset.wallet.accounts.map(
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
        'Princess portfolio/updated api error in fetchEthereumTransactions()',
      )
    })
  }

  subscribeEthereumTransactions(addresses: AssetEntity[]) {
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

  async fetchEthereumTransactions() {
    let addresses = await this.getAllAddresses()
    addresses = addresses.filter((address) => address.wallet.isActive)

    const activeEthAddresses = addresses.filter(
      (address) => address.network === ENetworks.ETHEREUM,
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
      prototype.assets = []

      const wallet = await this.walletRepository.save(prototype)

      await this.addAddressesFromXPub(wallet, xPub, ENetworks.ETHEREUM)
      await this.addAddressesFromXPub(wallet, xPub, ENetworks.BITCOIN)

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
      await Promise.all(
        xpubs.map((xpub) => {
          return this.addXPub(account, xpub.xpub, EWalletType.VAULT)
        }),
      )
      this.fetchEthereumTransactions()

      const newWallets = await this.lookUpByXPubs(
        xpubs.map((xpub) => xpub.xpub),
      )
      return newWallets
    } catch (e) {
      Sentry.captureException(e.message + ' while addNewWallet')

      throw new BadRequestException(e.message)
    }
  }

  async combineWallets(existingAccountId: number, anonymousId: number) {
    const existingAccount = await this.accountService.lookup({
      accountId: existingAccountId,
    })
    const wallets = await this.walletRepository.find({
      where: {
        accounts: { accountId: anonymousId },
      },
      relations: {
        accounts: true,
      },
    })
    wallets.map((wallet) => {
      wallet.accounts = wallet.accounts.filter(
        (account) => account.id !== anonymousId,
      )
      wallet.accounts.push(existingAccount)
    })

    return this.updateWallets(wallets)
  }
}
