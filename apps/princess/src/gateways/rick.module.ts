import { Module } from '@nestjs/common'
import { RickGateway } from './rick.gateway'
import { PortfolioService } from '../portfolio/portfolio.service'
import { HttpModule } from '@nestjs/axios'
import { CoinService } from '../coin/coin.service'

@Module({
  imports: [
    HttpModule, //
  ],
  providers: [
    RickGateway, //
    PortfolioService,
    CoinService,
  ],
})
export class RickModule {}
