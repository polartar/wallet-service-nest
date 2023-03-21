import { HttpModule } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { PortfolioService } from './portfolio.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { AppModule } from '../app/app.module'

describe('PortfolioService', () => {
  let service: PortfolioService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [Environment] }), //
        AppModule,
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
