import { UpdateWalletsActiveDto } from './dto/update-wallets-active.dto'
import { GetWalletHistoryDto } from './dto/get-wallet-history.dto'
import { AddWalletDto } from './dto/add-wallet.dto'
import { MoreThanOrEqual, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { RecordEntity } from './record.entity'
import { AddRecordDto } from './dto/add-record.dto'
import { EPeriod } from './wallet.types'
import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'

@Injectable()
export class WalletService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(RecordEntity)
    private readonly recordRepository: Repository<RecordEntity>,
  ) {}

  async getAllWallets(): Promise<WalletEntity[]> {
    return await this.walletRepository.find({
      relations: {
        account: true,
        history: true,
      },
    })
  }

  async addNewWallet(data: AddWalletDto): Promise<WalletEntity> {
    const provider = new ethers.providers.EtherscanProvider(
      'goerli',
      this.configService.get<string>(EEnvironment.infuraAPIKey),
    )
    const prototype = new WalletEntity()
    prototype.account = data.account
    prototype.address = data.address
    prototype.history = []
    prototype.type = data.type

    const [
      history, //
      balance,
      wallet,
    ] = await Promise.all([
      provider.getHistory(data.address),
      provider.getBalance(data.address),
      this.walletRepository.save(prototype),
    ])

    let currentBalance = balance
    const allHistories = await Promise.all(
      history
        .reverse()
        .map((record) => {
          currentBalance =
            record.from === data.address
              ? currentBalance.sub(record.value)
              : currentBalance.add(record.value)
          return this.addRecord({
            wallet: wallet,
            balance: currentBalance.toString(),
            timestamp: record.timestamp,
          })
        })
        .reverse(),
    )
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

  private _getDurationTime(period: string): number | null {
    const oneHour = 1000 * 3600
    switch (period) {
      case EPeriod.Day:
        return oneHour * 24
      case EPeriod.Month:
        return oneHour * 24 * 30
      case EPeriod.Months:
        return oneHour * 24 * 30 * 6
      case EPeriod.Year:
        return oneHour * 24 * 365
      case EPeriod.All:
      default:
        return null
    }
  }

  async getUserWalletHistory(data: GetWalletHistoryDto) {
    const periodAsNumber = this._getDurationTime(data.period)
    return this.walletRepository.find({
      where: {
        account: { id: data.accountId },
        history:
          periodAsNumber === null
            ? null
            : {
                timestamp: MoreThanOrEqual(periodAsNumber),
              },
      },
      relations: {
        history: true,
        account: true,
      },
    })
  }
}
