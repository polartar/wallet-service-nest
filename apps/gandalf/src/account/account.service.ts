import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common'
import { AccountEntity } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccountService {
    constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}
}
