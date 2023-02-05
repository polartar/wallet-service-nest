import { UpdateWalletsActiveDto } from './dto/update-wallets-active.dto'
import { GetWalletHistoryDto } from './dto/get-wallet-history.dto'
import { AddWalletDto } from './dto/add-wallet.dto'
import { IWallet } from './wallet.types'
import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { UpdateWalletsDto } from './dto/update-wallets.dto'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
  ) {}

  async getAllWallets(): Promise<IWallet[]> {
    return await this.walletRepository.find({
      relations: ['account'],
    })
  }

  addNewWallet(data: AddWalletDto): Promise<WalletEntity> {
    const wallet = new WalletEntity()
    wallet.account = data.account
    wallet.address = data.address
    wallet.balanceHistory = data.initialBalance
    wallet.type = data.type

    return this.walletRepository.save(wallet)
  }

  updateWalletsHistory(data: UpdateWalletsDto[]) {
    const promises = data.map((wallet) => {
      this.walletRepository.update(wallet.id, wallet)
    })

    return Promise.all(promises)
  }

  updateWalletsActive(data: UpdateWalletsActiveDto[]) {
    const updates = data.map(async (wallet) => {
      const newWallet = await this.walletRepository.findOne({
        where: { id: wallet.id, account: { id: wallet.accountId } },
      })
      newWallet.isActive = wallet.isActive
      return this.walletRepository.save(newWallet)
    })

    return Promise.all(updates)
  }

  async getUserWalletHistory(data: GetWalletHistoryDto) {
    return this.walletRepository.find({
      where: { account: { id: data.accountId } },
    })
  }
}
