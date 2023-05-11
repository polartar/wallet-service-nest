import { Test, TestingModule } from '@nestjs/testing'
import { AccountsService } from './accounts.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { MarketService } from '../market/market.service'

describe('AccountsService', () => {
  let service: AccountsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [AccountsService, MarketService],
    }).compile()

    service = module.get<AccountsService>(AccountsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
