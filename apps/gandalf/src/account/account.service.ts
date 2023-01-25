import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common'
import { AccountEntity } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { FindAccountDto } from './dto/find-account.dto';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
    ) {}

    create(createAccount: CreateAccountDto): Promise<AccountEntity> {
        const account = new AccountEntity()
        account.email = createAccount.email;
        account.name = createAccount.name;

        return this.accountRepository.save(account)
    }

    lookup(findAccount: FindAccountDto): Promise<AccountEntity> {
        return this.accountRepository.findOne({
        where: findAccount,
        })
    }
}
