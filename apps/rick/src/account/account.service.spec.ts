import { TypeOrmModule } from '@nestjs/typeorm'
import { Test, TestingModule } from '@nestjs/testing'
import { AccountService } from './account.service'
import { AccountEntity } from './account.entity'
import { WalletEntity } from '../wallet/wallet.entity'
import { TransactionEntity } from '../wallet/transaction.entity'
import { AssetEntity } from '../wallet/asset.entity'

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
            TransactionEntity,
            AssetEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          AccountEntity, //
          WalletEntity,
          TransactionEntity,
          AssetEntity,
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
