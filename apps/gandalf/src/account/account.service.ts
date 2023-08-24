import { Repository } from 'typeorm'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { AccountEntity } from './account.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateAccountDto } from './dto/create-account.dto'
import { FindAccountDto } from './dto/find-account.dto'
import { UpdateShardsDto } from './dto/update-account.dto'
import * as Sentry from '@sentry/node'
import { IAccountUpdate, IShard } from './account.types'

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

    Object.keys(data).map((key) => {
      if (data[key] === '') {
        data[key] = null
      }
    })

    const result = await this.accountRepository.update(accountId, data)
    if (result.affected === 1) {
      return 'Successfully updated'
    } else {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async deleteAccount(
    accountId: string,
    deviceId: string,
  ): Promise<AccountEntity> {
    const name = 'anonymous'
    const email = `any${deviceId}@gmail.com`

    return await this.updateAnonymousAccount(accountId, name, email, {
      accountShard: '',
      iCloudShard: '',
      vaultShard: '',
      passcodeKey: '',
      recoveryKey: '',
      serverShard: '',
    })
  }

  async updateAnonymousAccount(
    accountId: string,
    name: string,
    email: string,
    shards: IShard,
  ): Promise<AccountEntity> {
    const account = await this.getAccount(accountId)

    if (account) {
      if (account.email === email) {
        throw new BadRequestException('Email already exists')
      }
      await this.update(account.id, {
        name: name,
        email: email,
        accountShard: shards.accountShard,
        iCloudShard: shards.iCloudShard,
        vaultShard: shards.vaultShard,
        passcodeKey: shards.passcodeKey,
        recoveryKey: shards.recoveryKey,
        serverShard: shards.serverShard,
      })
      account.name = name
      account.email = email
      return account
    } else {
      throw new NotFoundException()
    }
  }
}
