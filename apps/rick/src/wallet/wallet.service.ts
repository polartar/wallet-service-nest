import { GetWalletHistoryDto } from './dto/get-wallet-history.dto'
import { AddWalletDto } from './dto/add-wallet.dto'
import { MoreThanOrEqual, Repository } from 'typeorm'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'
import {
  IAddressPath,
  IBTCTransaction,
  IBTCTransactionResponse,
  IWalletPath,
  SecondsIn,
} from './wallet.types'
import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { HistoryEntity } from './history.entity'
import { AddAddressDto } from './dto/add-address.dto'
import { AddressEntity } from './address.entity'
import { AddHistoryDto } from './dto/add-history.dto'
import { ECoinType, EWalletType } from '@rana/core'
import { IWalletActiveData } from '../portfolio/portfolio.types'

@Injectable()
export class WalletService {
  provider: ethers.providers.EtherscanProvider
  isProduction: boolean

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(HistoryEntity)
    private readonly historyRepository: Repository<HistoryEntity>,
  ) {
    this.isProduction = this.configService.get<boolean>(
      EEnvironment.isProduction,
    )
    this.provider = new ethers.providers.EtherscanProvider(
      this.isProduction ? 'mainnet' : 'goerli',
      this.configService.get<string>(EEnvironment.etherscanAPIKey),
    )
    this.confirmWalletBalances()
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

  async addNewWallet(data: AddWalletDto): Promise<WalletEntity> {
    const wallet = await this.lookUpByXPub(data.xPub)

    if (wallet) {
      if (wallet.type === data.walletType) {
        if (
          !wallet.accounts
            .map((account) => account.id)
            .includes(data.account.id)
        ) {
          wallet.accounts.push(data.account)
        }
        return this.walletRepository.save(wallet)
      } else {
        throw new Error('The parameters are not matched with existing one')
      }
    } else {
      const prototype = new WalletEntity()
      prototype.xPub = data.xPub
      prototype.accounts = [data.account]
      prototype.type = data.walletType
      prototype.address = data.xPub
      prototype.addresses = []
      prototype.path = 'path' // need to get the path from xpub

      if (data.walletType === EWalletType.METAMASK) {
        prototype.coinType = ECoinType.ETHEREUM
        prototype.path = IWalletPath.ETH
      } else if (data.walletType === EWalletType.VAULT) {
        prototype.coinType = ECoinType.BITCOIN
        prototype.path = IWalletPath.BTC
      }
      const wallet = await this.walletRepository.save(prototype)

      if (data.walletType !== EWalletType.HOTWALLET) {
        await this.addNewAddress({
          wallet,
          address: data.xPub,
          path:
            prototype.path === IWalletPath.BTC
              ? IAddressPath.BTC
              : IAddressPath.ETH,
        })
      } else {
        await this.addAddressesFromXPub(wallet, data.xPub)
      }

      return wallet
    }
  }

  async addAddressesFromXPub(wallet, xPub) {
    Logger.log('Should get all addresses', xPub, wallet)
  }

  async addNewAddress(data: AddAddressDto): Promise<AddressEntity> {
    const prototype = new AddressEntity()
    prototype.wallet = data.wallet
    prototype.address = data.address
    prototype.history = []
    prototype.path = data.path
    const address = await this.addressRepository.save(prototype)

    let allHistories
    try {
      if (data.wallet.coinType === ECoinType.ETHEREUM) {
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
      Logger.log(err.message)
      throw new BadRequestException(err.message)
    }

    return await this.addressRepository.save(address)
  }

  updateWallets(wallets: WalletEntity[]) {
    return Promise.all(
      wallets.map((wallet) => this.walletRepository.save(wallet)),
    )
  }

  async updateWalletsActive(data: IWalletActiveData): Promise<WalletEntity> {
    const wallet = await this.walletRepository.findOne({
      where: {
        id: data.id,
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

    return this.walletRepository.save(wallet)
  }

  addHistory(data: AddHistoryDto) {
    return this.historyRepository.save(data)
  }

  async getUserWalletHistory(data: GetWalletHistoryDto) {
    const periodAsNumber =
      data.period in SecondsIn ? SecondsIn[data.period] : null
    const timeInPast = this.getCurrentTimeBySeconds() - periodAsNumber || 0
    return this.walletRepository.find({
      where: {
        isActive: true,
        accounts: { id: data.accountId },
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
}
