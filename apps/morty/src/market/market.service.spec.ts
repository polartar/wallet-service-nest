import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { MarketService } from './market.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'

describe('MarketService', () => {
  let service: MarketService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [MarketService],
    }).compile()

    service = module.get<MarketService>(MarketService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
