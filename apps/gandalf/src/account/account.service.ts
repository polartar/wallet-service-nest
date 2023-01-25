import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common'
import { AccountEntity } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IAccountCreate, IAccountLookUp } from './account.types';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
    ) {}

    create(createAccount: IAccountCreate): Promise<AccountEntity> {
        const account = new AccountEntity()
        account.email = createAccount.email;
        account.name = createAccount.name;

        return this.accountRepository.save(account)
    }

    lookup(findAccount: IAccountLookUp): Promise<AccountEntity> {
        return this.accountRepository.findOne({
        where: findAccount,
        })
    }
}
