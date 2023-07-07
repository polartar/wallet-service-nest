import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { AccountEntity } from './account.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateAccountDto } from './dto/create-account.dto'
import {
  FindAccountByIdDto,
  FindAccountByEmailDto,
} from './dto/find-account.dto'
import { UpdateAccountDto } from './dto/update-account.dto'
import { WalletEntity } from '../wallet/wallet.entity'
import { AssetEntity } from '../wallet/asset.entity'

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async create(createAccount: CreateAccountDto): Promise<AccountEntity> {
    const existingAccount = await this.lookup({
      accountId: createAccount.accountId,
    })
    if (existingAccount) {
      return existingAccount
    }
    return this.accountRepository.save(createAccount)
  }

  async update(
    accountId: string,
    data: UpdateAccountDto,
  ): Promise<AccountEntity> {
    const account = await this.lookup({
      accountId: accountId,
    })
    if (account) {
      account.email = data.email
      account.name = data.name
      return this.accountRepository.save(account)
    } else {
      return this.create({ accountId, ...data })
    }
  }

  lookup(
    findAccount: FindAccountByIdDto | FindAccountByEmailDto,
  ): Promise<AccountEntity> {
    return this.accountRepository.findOne({
      where: findAccount,
    })
  }

  // async getAccount(accountId: string) {
  //   const account = await this.accountRepository.findOne({
  //     where: {
  //       accountId: accountId,
  //     },
  //   })

  //   return account
  // }

  // async checkHash(accountId: string, hash: string) {
  //   const wallets = await this.getWallets(accountId)

  //   const addresses = wallets.reduce(
  //     (allAddresses: AssetEntity[], wallet: WalletEntity) =>
  //       allAddresses.concat(allAddresses, wallet.assets),
  //     [],
  //   )

  //   const walletHash = addresses.map((address) => address.address).join(',')

  //   return walletHash === hash
  // }
}
