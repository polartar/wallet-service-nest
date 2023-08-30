import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { CoinController } from './coin.controller'
import { CoinService } from './coin.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'

describe('CoinController', () => {
  let controller: CoinController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      controllers: [CoinController],
      providers: [CoinService],
    }).compile()

    controller = module.get<CoinController>(CoinController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
