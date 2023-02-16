import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { MarketService } from './market.service'
import { IDuration } from './market.types'

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('ethereum')
  async setEthPrice(@Body() data: { ethereum: string }) {
    this.marketService.setEthPrice(data.ethereum)
    return true
  }
  @Post('bitcoin')
  async setBtcPrice(@Body() data: { bitcoin: string }) {
    this.marketService.setBtcPrice(data.bitcoin)
    return true
  }

  @Get(':duration')
  async getMarketData(@Param('duration') duration: IDuration) {
    return this.marketService.getMarketData(duration)
  }
}
