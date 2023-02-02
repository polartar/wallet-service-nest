import { GetWalletHistoryDto } from './dto/get-wallet-history.dto'
import { AddWalletDto } from './dto/add-wallet.dto'
import { IWallet } from './wallet.types'
import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
  ) {}

  async getAllWallets(): Promise<IWallet[]> {
    const allWallets = await this.walletRepository.find({
      relations: ['account'],
    })
    const addresses = allWallets.map((wallet) => wallet.address)
    const uniqueWallets = allWallets.filter(
      (wallet: IWallet, index: number) =>
        !addresses.includes(wallet.address, index + 1),
    )
    return uniqueWallets
  }

  addWallet(data: AddWalletDto): Promise<WalletEntity> {
    const wallet = new WalletEntity()
    wallet.account = data.account
    wallet.address = data.address
    wallet.balance = data.balance
    wallet.type = data.type

    return this.walletRepository.save(wallet)
  }

  addWallets(data: AddWalletDto[]) {
    const wallets = data.map((newWallet) => {
      const wallet = new WalletEntity()
      wallet.account = newWallet.account
      wallet.address = newWallet.address
      wallet.balance = newWallet.balance
      wallet.type = newWallet.type
      return wallet
    })

    this.walletRepository.save(wallets)
  }

  async getUserWalletHistory(data: GetWalletHistoryDto) {
    return this.walletRepository.find({
      where: { account: { id: data.accountId } },
    })
  }
}
