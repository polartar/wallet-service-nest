import { TypeOrmModule } from '@nestjs/typeorm'
import { Test, TestingModule } from '@nestjs/testing'
import { AccountService } from './account.service'
import { RickAccountEntity as AccountEntity } from './account.entity'
import { WalletEntity } from '../wallet/wallet.entity'
import { HistoryEntity } from '../wallet/history.entity'
import { AddressEntity } from '../wallet/address.entity'

describe('AccountService', () => {
  let service: AccountService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            AccountEntity, //
            WalletEntity,
            HistoryEntity,
            AddressEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          AccountEntity, //
          WalletEntity,
          HistoryEntity,
          AddressEntity,
        ]),
      ],
      providers: [AccountService],
    }).compile()

    service = module.get<AccountService>(AccountService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should lookUp return empty', async () => {
    const account = await service.lookup({ email: 'test@gmail.com' })
    expect(account).toBeNull()
  })

  it('should create new account', async () => {
    await service.create({
      email: 'test@gmail.com',
      name: 'test',
      accountId: 1,
    })
    const account = await service.lookup({ email: 'test@gmail.com' })
    expect(account.email).toBe('test@gmail.com')
  })
})
