import { Controller, Get, ParseEnumPipe, Query } from '@nestjs/common'
import { MarketService } from './market.service'
import { EPeriod, ENetworks } from '@rana/core'

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('eth')
  getEthMarketData() {
    return this.marketService.getMarketData(ENetworks.ETHEREUM)
  }

  @Get('btc')
  getBtcMarketData() {
    return this.marketService.getMarketData(ENetworks.BITCOIN)
  }

  @Get('eth/history')
  getEthHistoricalData(
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(ENetworks.ETHEREUM, period)
  }

  @Get('btc/history')
  getBtcHistoricalData(
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(ENetworks.BITCOIN, period)
  }
}
