import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { AccountEntity } from './account.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateAccountDto } from './dto/create-account.dto'
import {
  FindAccountByIdDto,
  FindAccountByEmailDto,
} from './dto/find-account.dto'

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async create(createAccount: CreateAccountDto): Promise<AccountEntity> {
    const existingAccount = await this.lookup({ email: createAccount.email })
    if (existingAccount) {
      throw new Error('Email already exists')
    }
    return this.accountRepository.save(createAccount)
  }

  lookup(
    findAccount: FindAccountByIdDto | FindAccountByEmailDto,
  ): Promise<AccountEntity> {
    return this.accountRepository.findOne({
      where: findAccount,
    })
  }
}
