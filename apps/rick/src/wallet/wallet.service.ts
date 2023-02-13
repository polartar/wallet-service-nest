import { UpdateWalletsActiveDto } from './dto/update-wallets-active.dto'
import { GetWalletHistoryDto } from './dto/get-wallet-history.dto'
import { AddWalletDto } from './dto/add-wallet.dto'
import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { UpdateWalletsDto } from './dto/update-wallets.dto'
import { RecordEntity } from './record.entity'
import { AddRecordDto } from './dto/add-record.dto'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(RecordEntity)
    private readonly recordRepository: Repository<WalletEntity>,
  ) {}

  async getAllWallets(): Promise<WalletEntity[]> {
    return await this.walletRepository.find({
      relations: {
        account: true,
        history: true,
      },
    })
  }

  addNewWallet(data: AddWalletDto): Promise<WalletEntity> {
    const wallet = new WalletEntity()
    wallet.account = data.account
    wallet.address = data.address
    wallet.history = []
    wallet.type = data.type

    return this.walletRepository.save(wallet)
  }

  updateWallets(wallets: WalletEntity[]) {
    return Promise.all(
      wallets.map((wallet) => this.walletRepository.update(wallet.id, wallet)),
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
    return this.walletRepository.find({
      where: { account: { id: data.accountId } },
      relations: {
        history: true,
        account: true,
      },
    })
  }
}
