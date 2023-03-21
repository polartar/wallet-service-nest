import { Test, TestingModule } from '@nestjs/testing'
import { PortfolioController } from './portfolio.controller'
import { PortfolioService } from './portfolio.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { AppModule } from '../app/app.module'

describe('PortfolioController', () => {
  let controller: PortfolioController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [Environment] }), //
        AppModule,
        HttpModule,
      ],
      controllers: [PortfolioController],
      providers: [
        PortfolioService, //
      ],
    }).compile()

    controller = module.get<PortfolioController>(PortfolioController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
