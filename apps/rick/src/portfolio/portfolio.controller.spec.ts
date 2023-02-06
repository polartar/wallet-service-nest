import { WalletModule } from './../wallet/wallet.module'
import { Test, TestingModule } from '@nestjs/testing'
import { PortfolioController } from './portfolio.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from '../wallet/wallet.entity'
import { AccountEntity } from '../account/account.entity'
import { WalletService } from '../wallet/wallet.service'
import { PortfolioService } from './portfolio.service'
import { AccountModule } from '../account/account.module'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'

describe('PortfolioController', () => {
  let controller: PortfolioController

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
            WalletEntity, //
            AccountEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          WalletEntity, //
          AccountEntity,
        ]),
        WalletModule,
        AccountModule,
      ],
      controllers: [PortfolioController],
      providers: [
        WalletService, //
        PortfolioService,
      ],
    }).compile()

    controller = module.get<PortfolioController>(PortfolioController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
