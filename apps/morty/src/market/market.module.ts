import { Module } from '@nestjs/common'
import { MarketController } from './market.controller'
import { CoinService } from './market.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [MarketController],
  providers: [CoinService],
})
export class MarketModule {}
