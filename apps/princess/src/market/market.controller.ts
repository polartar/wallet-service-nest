import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
} from '@nestjs/common'
import { MarketService } from './market.service'
import { EPeriod, ICoinType } from '@rana/core'

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

  @Get(':coin')
  async getEthMarketData(
    @Param('coin', new ParseEnumPipe(ICoinType)) coin: ICoinType,
  ) {
    return this.marketService.getMarketData(coin)
  }

  @Get('eth/history')
  getEthHistoricalData(
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(ICoinType.ETHEREUM, period)
  }
  @Get('btc/history')
  getBtcHistoricalData(
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(ICoinType.BITCOIN, period)
  }
}
