import { formatEther } from 'ethers/lib/utils'
import { UpdateWalletBalancesDto } from './dto/update-wallet.dto copy'
import { AddWalletDto } from './dto/add-wallet.dto'
import { IWallet } from './wallet.types'
import { In, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { WalletEntity } from './wallet.entity'
import { InjectRepository } from '@nestjs/typeorm'
// import { CreateWalletDto } from './dto/create-wallet.dto'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
  ) {}

  // create(createWallet: CreateWalletDto): Promise<WalletEntity> {
  //   const Wallet = new WalletEntity()

  //   return this.WalletRepository.save(Wallet)
  // }

  async getAllWalets(): Promise<IWallet[]> {
    const allWallets = await this.walletRepository.find()
    return allWallets
  }

  async addWallets(data: AddWalletDto): Promise<WalletEntity> {
    const wallet = new WalletEntity()
    wallet.account = data.account
    wallet.address = data.address
    wallet.balance = data.balance
    wallet.type = data.type

    return this.walletRepository.save(wallet)
  }

  async updateBalances(data: UpdateWalletBalancesDto[]) {
    const ids = data.map((wallet) => wallet.id)
    let wallets = await this.walletRepository.find({
      where: { id: In(ids) },
    })
    wallets = wallets.map((wallet) => {
      const updatedWallet = data.find((item) => item.id === wallet.id)
      return {
        ...wallet,
        balance: updatedWallet.balance.toString(),
      }
    })

    this.walletRepository.save(wallets)
  }
}
