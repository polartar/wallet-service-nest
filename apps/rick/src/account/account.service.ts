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
    accountId: number,
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
}
