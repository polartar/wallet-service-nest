import { Test, TestingModule } from '@nestjs/testing'
import { WalletsService } from './wallet.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { MarketService } from '../market/market.service'
import { TransactionService } from '../transaction/transaction.service'

describe('WalletsService', () => {
  let service: WalletsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [WalletsService, MarketService, TransactionService],
    }).compile()

    service = module.get<WalletsService>(WalletsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
