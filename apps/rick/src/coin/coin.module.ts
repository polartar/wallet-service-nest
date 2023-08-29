import { Module } from '@nestjs/common'
import { CoinController } from './coin.controller'
import { CoinService } from './coin.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [CoinController],
  providers: [CoinService],
})
export class CoinModule {}
