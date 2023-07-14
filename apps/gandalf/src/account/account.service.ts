import { Repository } from 'typeorm'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { AccountEntity } from './account.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateAccountDto } from './dto/create-account.dto'
import { FindAccountDto } from './dto/find-account.dto'
import { UpdateShardsDto } from './dto/update-account.dto'
import * as Sentry from '@sentry/node'
import { IAccountUpdate } from './account.types'

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  create(createAccount: CreateAccountDto): Promise<AccountEntity> {
    return this.accountRepository.save(createAccount)
  }

  async update(accountId: string, data: IAccountUpdate) {
    return await this.accountRepository.update(accountId, data)
  }

  lookup(findAccount: FindAccountDto): Promise<AccountEntity> {
    return this.accountRepository.findOne({
      where: findAccount,
    })
  }

  getAccount(accountId: string): Promise<AccountEntity> {
    return this.accountRepository.findOne({
      where: { id: accountId },
    })
  }

  async updateShards(accountId: string, data: UpdateShardsDto) {
    const account = await this.getAccount(accountId)
    if (!account) {
      Sentry.captureException(`updateShards(): Not found user(${accountId})`)
      throw new BadRequestException(`Not found user(${accountId})`)
    }

    const result = await this.accountRepository.update(accountId, data)
    if (result.affected === 1) {
      return 'Successfully updated'
    } else {
      throw new InternalServerErrorException('Something went wrong')
    }
  }
}
