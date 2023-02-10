import { WalletModule } from './../wallet/wallet.module'
import { AccountModule } from './../account/account.module'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PortfolioService } from './portfolio.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from '../account/account.entity'
import { WalletEntity } from '../wallet/wallet.entity'
import { Environment } from './../environments/environment.dev'
import { HttpModule } from '@nestjs/axios'

describe('PortfolioService', () => {
  let service: PortfolioService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [Environment] }),

        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            AccountEntity, //
            WalletEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          AccountEntity, //
          WalletEntity,
        ]),
        AccountModule,
        WalletModule,
        HttpModule,
      ],
      providers: [PortfolioService],
    }).compile()

    service = module.get<PortfolioService>(PortfolioService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
