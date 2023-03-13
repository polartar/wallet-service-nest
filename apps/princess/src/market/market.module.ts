import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { MarketController } from './market.controller'
import { MarketService } from './market.service'

@Module({
  imports: [HttpModule],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
