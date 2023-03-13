import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { MarketService } from './market.service'
import { IDuration } from './market.types'

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('ethereum')
  async setEthPrice(@Body() price: string) {
    this.marketService.setEthPrice(price)
  }
  @Post('bitcoin')
  async setBtcPrice(@Body() price: string) {
    this.marketService.setBtcPrice(price)
  }

  @Get(':duration')
  async getMarketData(@Param('duration') duration: IDuration) {
    console.log('getting marketdata')
    return this.marketService.getMarketData(duration)
  }
}
