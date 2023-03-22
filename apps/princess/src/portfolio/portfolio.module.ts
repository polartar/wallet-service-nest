import { Module } from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { HttpModule } from '@nestjs/axios'
import { PortfolioController } from './portfolio.controller'

@Module({
  imports: [
    HttpModule, //
  ],
  providers: [PortfolioService],
  controllers: [PortfolioController],
})
export class PortfolioModule {}
