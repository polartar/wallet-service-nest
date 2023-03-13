import { RickModule } from './../gateways/rick.module'
import { Module } from '@nestjs/common'
import { AnonModule } from '../gateways/anon.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { NewsModule } from '../news/news.module'
import { MarketModule } from '../market/market.module'

@Module({
  imports: [
    AnonModule, //
    RickModule,
    NewsModule,
    MarketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
