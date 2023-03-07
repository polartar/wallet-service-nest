import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { MarketController } from './market.controller'
import { MarketService } from './market.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'

describe('MarketController', () => {
  let controller: MarketController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      controllers: [MarketController],
      providers: [MarketService],
    }).compile()

    controller = module.get<MarketController>(MarketController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
