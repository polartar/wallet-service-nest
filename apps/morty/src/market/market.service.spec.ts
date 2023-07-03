import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { CoinService } from './market.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'

describe('CoinService', () => {
  let service: CoinService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [CoinService],
    }).compile()

    service = module.get<CoinService>(CoinService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
