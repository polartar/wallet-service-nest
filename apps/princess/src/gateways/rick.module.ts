import { Module } from '@nestjs/common'
import { RickGateway } from './rick.gateway'
import { PortfolioService } from '../portfolio/portfolio.service'
import { HttpModule } from '@nestjs/axios'
import { MarketService } from '../coin/coin.service'

@Module({
  imports: [
    HttpModule, //
  ],
  providers: [
    RickGateway, //
    PortfolioService,
    MarketService,
  ],
})
export class RickModule {}
