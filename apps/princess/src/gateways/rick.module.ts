import { Module } from '@nestjs/common'
import { RickGateway } from './rick.gateway'
import { PortfolioService } from '../portfolio/portfolio.service'
import { HttpModule } from '@nestjs/axios'
import { MarketService } from '../market/market.service'
// import { ConfigModule } from '@nestjs/config'
// import { Environment } from '../environments/environment.dev'

@Module({
  imports: [
    HttpModule, //
    // ConfigModule.forRoot({ load: [Environment] }),
  ],
  providers: [
    RickGateway, //
    PortfolioService,
    MarketService,
  ],
})
export class RickModule {}
