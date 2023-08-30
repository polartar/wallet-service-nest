import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common'
import { CoinService } from './coin.service'
import { EPeriod, ECoinTypes } from '@rana/core'

@Controller('coin')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Get(':coinType')
  getEthMarketData(@Param('coinType') coinType: ECoinTypes) {
    return this.coinService.getMarketData(coinType)
  }

  @Get(':coinType/history')
  getHistoricalData(
    @Param('coinType') coinType: ECoinTypes,
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.coinService.getHistoricalData(coinType, period)
  }

  @Get(':coinType/period')
  getHistoricalDataWithPeriod(
    @Param('coinType') coinType: ECoinTypes,
    @Query('startTime') startTime: number,
    @Query('endTime') endTime: number,
  ) {
    return this.coinService.getHistoricalDataWithPeriod(
      coinType,
      startTime,
      endTime,
    )
  }
}
