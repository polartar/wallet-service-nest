import { Controller, Get, Param, Query } from '@nestjs/common'
import { MarketService } from './market.service'
import { ICoinType, IDuration } from './market.type'

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('eth/:duration')
  getEthMarketDat(@Param('duration') duration: IDuration) {
    return this.marketService.getMarketData(ICoinType.ETHEREUM, duration)
  }

  @Get('btc/:duration')
  getBtcMarketDat(@Param('duration') duration: IDuration) {
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
