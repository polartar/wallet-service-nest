import { Controller, Get, ParseEnumPipe, Query } from '@nestjs/common'
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
  getEthHistoricalData(
    @Query('period', new ParseEnumPipe(IDuration)) period: IDuration,
  ) {
    return this.marketService.getHistoricalData(ICoinType.ETHEREUM, period)
  }
  @Get('btc/historical')
  getBtcHistoricalData(
    @Query('period', new ParseEnumPipe(IDuration)) period: IDuration,
  ) {
    return this.marketService.getHistoricalData(ICoinType.BITCOIN, period)
  }
}
