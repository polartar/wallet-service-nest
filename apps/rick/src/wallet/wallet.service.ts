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

  updateWallets(data: UpdateWalletsDto[]) {
    const promises = data.map((wallet) => {
      this.walletRepository.update(wallet.id, wallet)
    })

    return Promise.all(promises)
  }

  async getUserWalletHistory(data: GetWalletHistoryDto) {
    return this.walletRepository.find({
      where: { account: { id: data.accountId } },
    })
  }
}
