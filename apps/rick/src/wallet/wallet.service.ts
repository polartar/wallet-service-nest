import { UpdateWalletsActiveDto } from './dto/update-wallets-active.dto'
import { GetWalletHistoryDto } from './dto/get-wallet-history.dto'
import { AddWalletDto } from './dto/add-wallet.dto'
import { MoreThanOrEqual, Repository, SelectQueryBuilder } from 'typeorm'
import { Injectable, Logger } from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { ICoinType, IWalletType, SecondsIn } from './wallet.types'
import { BigNumber, ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { parseUnits } from 'ethers/lib/utils'
import { HistoryEntity } from './history.entity'
import { AddAddressDto } from './dto/add-address.dto'
import { AddressEntity } from './address.entity'
import { AddHistoryDto } from './dto/add-history.dto'

@Injectable()
export class WalletService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(HistoryEntity)
    private readonly historyRepository: Repository<HistoryEntity>,
  ) {}

  getCurrentTimeBySeconds() {
    return Math.floor(Date.now() / 1000)
  }

  async getAllAddresses(): Promise<AddressEntity[]> {
    return await this.addressRepository.find({
      relations: {
        wallet: true,
        history: true,
      },
    })
  }

  async getBTCTransactionHistories(
    address: AddressEntity,
  ): Promise<HistoryEntity[]> {
    const txResponse = await firstValueFrom(
      this.httpService.get(
        `https://api.blockcypher.com/v1/btc/main/addrs/${address.address}`,
      ),
    )

    let currentBalance = txResponse.data.balance
    const allHistories = await Promise.all(
      txResponse.data.txrefs.map((record) => {
        const prevBalance = currentBalance
        currentBalance = record.spent
          ? currentBalance - record.value
          : currentBalance + record.value
        // need to get from and to addresses
        return this.addHistory({
          address: address,
          from: '',
          to: '',
          amount: '',
          hash: record.tx_hash,
          balance: prevBalance.toString(),
          timestamp: Math.floor(new Date(record.confirmed).getTime() / 1000),
        })
      }),
    )

    return allHistories
  }
  async getETHTransactionHistories(
    address: AddressEntity,
  ): Promise<HistoryEntity[]> {
    const provider = new ethers.providers.EtherscanProvider(
      'goerli',
      this.configService.get<string>(EEnvironment.etherscanAPIKey),
    )
    const [
      history, //
      balance,
    ] = await Promise.all([
      provider.getHistory(address.address),
      provider.getBalance(address.address),
    ])

    // let currentBalance = balance
    const allHistories = await Promise.all(
      history.reverse().map((record) => {
        // const prevBalance = currentBalance
        const fee = record.gasLimit.mul(record.gasPrice)
        let amount = BigNumber.from(0)
        const walletAddress = address.address.toLowerCase()
        if (
          record.from.toLowerCase() === walletAddress ||
          record.to.toLowerCase() === walletAddress
        ) {
          if (record.from !== record.to) {
            amount = record.value
          }
          if (record.from === walletAddress) {
            amount = amount.add(fee)
          }
        }
        // currentBalance = currentBalance.add(fee)
        // currentBalance =
        //   record.from === address.address
        //     ? currentBalance.add(record.value)
        //     : currentBalance.sub(record.value)

        return this.addHistory({
          address,
          from: record.from,
          to: record.to,
          hash: record.hash,
          amount: amount.toString(),
          balance: balance.toString(),
          timestamp: record.timestamp,
        })
      }),
    )
    return allHistories
  }

  async lookUpByXPub(xPub: string): Promise<WalletEntity> {
    return await this.walletRepository.findOne({
      where: { xPub },
      relations: { accounts: true },
    })
  }

  async addNewWallet(data: AddWalletDto): Promise<WalletEntity> {
    const wallet = await this.lookUpByXPub(data.xPub)
    console.log({ wallet })
    if (wallet) {
      if (
        wallet.coinType === data.coinType &&
        wallet.type === data.walletType
      ) {
        if (!wallet.accounts.includes(data.account)) {
          wallet.accounts.push(data.account)
        }
        return wallet
      } else {
        throw new Error('The parameters are not matched with existing one')
      }
    } else {
      const prototype = new WalletEntity()
      prototype.xPub = data.xPub
      prototype.accounts = [data.account]
      prototype.coinType = data.coinType
      prototype.type = data.walletType
      prototype.address = data.xPub
      prototype.addresses = []
      prototype.path = 'path' // need to get the path from xpub

      const wallet = await this.walletRepository.save(prototype)

      if (data.walletType === IWalletType.METAMASK) {
        this.addNewAddress({ wallet, address: data.xPub, path: 'path' })
      } else {
        this.addAddressesFromXPub(wallet, data.xPub)
      }

      return this.walletRepository.save(wallet)
    }
  }

  async addAddressesFromXPub(wallet, xPub) {
    Logger.log('Should get all addresses')
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
      if (data.wallet.coinType === ICoinType.ETHEREUM) {
        allHistories = await this.getETHTransactionHistories(address)
      } else {
        allHistories = await this.getBTCTransactionHistories(address)
      }
      address.history = allHistories
    } catch (err) {
      Logger.log(err.message)
      throw new Error('Invalid API key or API limit error')
    }

    return this.walletRepository.save(address)
  }

  updateWallets(wallets: WalletEntity[]) {
    return Promise.all(
      wallets.map((wallet) => this.walletRepository.save(wallet)),
    )
  }

  updateWalletsActive(data: UpdateWalletsActiveDto[]) {
    // need to filter by account
    const updates = data.map(async (wallet) => {
      const newWallet = await this.walletRepository.findOne({
        relations: {
          accounts: true,
        },
      })
      newWallet.isActive = wallet.isActive
      return this.walletRepository.save(newWallet)
    })

    return Promise.all(updates)
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
    // })
  }
}
