import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MarketModule } from '../market/market.module'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'

@Module({
  imports: [
    MarketModule,
    ConfigModule.forRoot({ isGlobal: true, load: [Environment] }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
