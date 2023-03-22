import { RickModule } from './../gateways/rick.module'
import { Module } from '@nestjs/common'
import { AnonModule } from '../gateways/anon.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { NewsModule } from '../news/news.module'
import { MarketModule } from '../market/market.module'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { PortfolioModule } from '../portfolio/portfolio.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [Environment] }),
    AnonModule, //
    RickModule,
    NewsModule,
    MarketModule,
    PortfolioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
