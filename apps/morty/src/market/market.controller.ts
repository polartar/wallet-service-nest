import { Controller, Get, Query } from '@nestjs/common'
import { MarketService } from './market.service'
import { ICoinType, IDuration } from './market.type'

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('eth')
  getEthMarketDat() {
    return this.marketService.getMarketData(ICoinType.ETHEREUM)
  }

  @Get('btc')
  getBtcMarketDat() {
    return this.marketService.getMarketData(ICoinType.BITCOIN)
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
