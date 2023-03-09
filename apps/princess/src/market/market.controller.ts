import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { MarketService } from './market.service'
import { ICoinType } from './market.types'
import { EPeriod } from '@rana/core'

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

  @Get('/eth/:period')
  async getEthMarketData(@Param('period') period: EPeriod) {
    return this.marketService.getMarketData(ICoinType.ETHEREUM, period)
  }
  @Get('/btc/:period')
  async getBtMarketData(@Param('period') period: EPeriod) {
    return this.marketService.getMarketData(ICoinType.BITCOIN, period)
  }

  @Get('eth/historical')
  getEthHistoricalData(@Query() query: { period: EPeriod }) {
    return this.marketService.getHistoricalData(
      ICoinType.ETHEREUM,
      query.period,
    )
  }
  @Get('btc/historical')
  getBtcHistoricalData(@Query() query: { period: EPeriod }) {
    return this.marketService.getHistoricalData(ICoinType.BITCOIN, query.period)
  }
}
