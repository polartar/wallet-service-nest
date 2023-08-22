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
    const account = await this.lookup({ accountId })
    if (account) {
      await this.accountRepository
        .createQueryBuilder()
        .update(account)
        .set({ name: data.name, email: data.email })
        .where('accountId = :accountId', { accountId })
        .execute()
      return {
        ...account,
        ...data,
      }
    } else {
      return await this.create({ accountId, ...data })
    }
  }

  lookup(
    findAccount: FindAccountByIdDto | FindAccountByEmailDto,
  ): Promise<AccountEntity> {
    return this.accountRepository.findOne({
      where: findAccount,
    })
  }

  // async deleteAccount(
  //   accountId: string,
  //   deviceId: string,
  // ): Promise<AccountEntity> {
  //   const name = 'anonymous'
  //   const email = `any${deviceId}@gmail.com`

  //   await this.walletService.deleteWallets(accountId)

  //   return await this.update(accountId, {
  //     name,
  //     email,
  //   })
  // }
}
