import { PortfolioModule } from './../portfolio/portfolio.module'
import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PortfolioService } from '../portfolio/portfolio.service'

@Module({
  imports: [PortfolioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // constructor(private readonly portfolioService: PortfolioService) {
  //   portfolioService.runService()
  // }
}
