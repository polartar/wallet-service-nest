import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { MarketController } from './market.controller'
import { MarketService } from './market.service'
import { Environment } from '../environments/environment.dev'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    ConfigModule.forRoot({ load: [Environment] }), //
    HttpModule,
  ],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
