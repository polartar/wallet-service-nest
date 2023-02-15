import { Controller, Get, Param } from '@nestjs/common'
import { MarketService } from './market.service'
import { IDuration } from './market.type'

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get(':duration')
  getMarketData(@Param('duration') duration: IDuration) {
    return this.marketService.getMarketData(duration)
  }
}
