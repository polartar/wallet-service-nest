import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common'
import { CoinService } from './market.service'
import { EPeriod, ECoinTypes } from '@rana/core'

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: CoinService) {}

  @Get(':/coinType')
  getEthMarketData(@Param('coinType') coinType: ECoinTypes) {
    return this.marketService.getMarketData(coinType)
  }

  @Get(':coinType/history')
  getEthHistoricalData(
    @Param('coinType') coinType: ECoinTypes,
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(coinType, period)
  }
}
