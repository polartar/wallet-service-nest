import { Module } from '@nestjs/common'
import { MarketController } from './market.controller'
import { MarketService } from './market.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
