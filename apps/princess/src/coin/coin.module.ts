import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { CoinController } from './coin.controller'
import { CoinService } from './coin.service'

@Module({
  imports: [HttpModule],
  controllers: [CoinController],
  providers: [CoinService],
})
export class MarketModule {}
