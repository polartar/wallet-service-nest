import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { MarketService } from './market.service'
import { ICoinType, IDuration } from './market.types'

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

  @Get('/eth/:duration')
  async getEthMarketData(@Param('duration') duration: IDuration) {
    return this.marketService.getMarketData(ICoinType.ETHEREUM, duration)
  }
  @Get('/btc/:duration')
  async getBtMarketData(@Param('duration') duration: IDuration) {
    return this.marketService.getMarketData(ICoinType.BITCOIN, duration)
  }

  @Get('eth/historical')
  getEthHistoricalData(@Query() query: { period: IDuration }) {
    return this.marketService.getHistoricalData(
      ICoinType.ETHEREUM,
      query.period,
    )
  }
  @Get('btc/historical')
  getBtcHistoricalData(@Query() query: { period: IDuration }) {
    return this.marketService.getHistoricalData(ICoinType.BITCOIN, query.period)
  }
}
