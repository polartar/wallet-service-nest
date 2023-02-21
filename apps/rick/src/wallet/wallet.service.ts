import { UpdateWalletsActiveDto } from './dto/update-wallets-active.dto'
import { GetWalletHistoryDto } from './dto/get-wallet-history.dto'
import { AddWalletDto } from './dto/add-wallet.dto'
import { MoreThanOrEqual, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { RecordEntity } from './record.entity'
import { AddRecordDto } from './dto/add-record.dto'
import { IWalletType, SecondsIn } from './wallet.types'
import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { parseUnits } from 'ethers/lib/utils'

@Injectable()
export class WalletService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(RecordEntity)
    private readonly recordRepository: Repository<RecordEntity>,
  ) {}

  getCurrentTimeBySeconds() {
    return Math.floor(Date.now() / 1000)
  }

  async getAllWallets(): Promise<WalletEntity[]> {
    return await this.walletRepository.find({
      relations: {
        account: true,
        history: true,
      },
    })
  }

  async getBTCTransactionHistories(
    address: string,
    wallet: WalletEntity,
  ): Promise<RecordEntity[]> {
    const txResponse = await firstValueFrom(
      this.httpService.get(
        `https://api.blockcypher.com/v1/btc/main/addrs/${address}`,
      ),
    )

    let currentBalance = txResponse.data.balance
    const allHistories = await Promise.all(
      txResponse.data.txrefs.map((record) => {
        const prevBalance = currentBalance
        currentBalance = record.spent
          ? currentBalance - record.value
          : currentBalance + record.value
        return this.addRecord({
          wallet: wallet,
          balance: parseUnits(prevBalance.toString(), 8).toString(),
          timestamp: Math.floor(new Date(record.confirmed).getTime() / 1000),
        })
      }),
    )

    return allHistories
  }
  async getETHTransactionHistories(
    address: string,
    wallet: WalletEntity,
  ): Promise<RecordEntity[]> {
    const provider = new ethers.providers.EtherscanProvider(
      'goerli',
      this.configService.get<string>(EEnvironment.etherscanAPIKey),
    )
    const [
      history, //
      balance,
    ] = await Promise.all([
      provider.getHistory(address),
      provider.getBalance(address),
    ])

    let currentBalance = balance
    const allHistories = await Promise.all(
      history.reverse().map((record) => {
        const prevBalance = currentBalance
        const fee = record.gasLimit.mul(record.gasPrice)
        currentBalance = currentBalance.add(fee)
        currentBalance =
          record.from === address
            ? currentBalance.add(record.value)
            : currentBalance.sub(record.value)

        return this.addRecord({
          wallet: wallet,
          balance: prevBalance.toString(),
          timestamp: record.timestamp,
        })
      }),
    )
    return allHistories
  }

  async addNewWallet(data: AddWalletDto): Promise<WalletEntity> {
    const prototype = new WalletEntity()
    prototype.account = data.account
    prototype.address = data.address
    prototype.history = []
    prototype.type = data.type
    const wallet = await this.walletRepository.save(prototype)

    let allHistories
    if (data.type === IWalletType.ETHEREUM) {
      allHistories = await this.getETHTransactionHistories(data.address, wallet)
    } else {
      allHistories = await this.getBTCTransactionHistories(data.address, wallet)
    }

    wallet.history = allHistories
    return this.walletRepository.save(wallet)
  }

  updateWallets(wallets: WalletEntity[]) {
    return Promise.all(
      wallets.map((wallet) => this.walletRepository.save(wallet)),
    )
  }

  updateWalletsActive(data: UpdateWalletsActiveDto[]) {
    const updates = data.map(async (wallet) => {
      const newWallet = await this.walletRepository.findOne({
        where: { id: wallet.id, account: { id: wallet.accountId } },
        relations: {
          history: true,
          account: true,
        },
      })
      newWallet.isActive = wallet.isActive
      return this.walletRepository.save(newWallet)
    })

    return Promise.all(updates)
  }

  addRecord(data: AddRecordDto) {
    const record = new RecordEntity()
    record.wallet = data.wallet
    record.timestamp = data.timestamp
    record.balance = data.balance

    return this.recordRepository.save(record)
  }

  async getUserWalletHistory(data: GetWalletHistoryDto) {
    const periodAsNumber =
      data.period in SecondsIn ? SecondsIn[data.period] : null
    const timeInPast = this.getCurrentTimeBySeconds() - periodAsNumber || 0
    return this.walletRepository.find({
      where: {
        account: { id: data.accountId },
        history:
          periodAsNumber === null
            ? null
            : {
                timestamp: MoreThanOrEqual(timeInPast),
              },
      },
      order: {
        history: {
          timestamp: 'DESC',
        },
      },
      relations: {
        history: true,
        account: true,
      },
    })
  }
}
