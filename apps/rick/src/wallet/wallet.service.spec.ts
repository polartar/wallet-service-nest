import { TypeOrmModule } from '@nestjs/typeorm'
import { Test, TestingModule } from '@nestjs/testing'
import { WalletService } from './wallet.service'
import { WalletEntity } from './wallet.entity'
import { AccountEntity } from '../account/account.entity'

describe('WalletService', () => {
  let service: WalletService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            WalletEntity, //
            AccountEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          WalletEntity, //
          AccountEntity,
        ]),
      ],
      providers: [WalletService],
    }).compile()

    service = module.get<WalletService>(WalletService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
