import { Controller, Get, ParseEnumPipe, Query } from '@nestjs/common'
import { MarketService } from './market.service'
import { EPeriod, ECoinType } from '@rana/core'

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('eth')
  getEthMarketDat() {
    return this.marketService.getMarketData(ECoinType.ETHEREUM)
  }

  @Get('btc')
  getBtcMarketDat() {
    return this.marketService.getMarketData(ECoinType.BITCOIN)
  }

  @Get('eth/history')
  getEthHistoricalData(
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(ECoinType.ETHEREUM, period)
  }

  @Get('btc/history')
  getBtcHistoricalData(
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(ECoinType.BITCOIN, period)
  }
}
