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
import { EPeriod, ECoinType } from '@rana/core'
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'

@Controller('market')
@ApiTags('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @ApiOperation({ summary: "This api can't be called directly" })
  @Post('ethereum')
  async setEthPrice(@Body() data: { ethereum: string }) {
    this.marketService.setEthPrice(data.ethereum)
    return true
  }

  @ApiOperation({ summary: "This api can't be called directly" })
  @Post('bitcoin')
  async setBtcPrice(@Body() data: { bitcoin: string }) {
    this.marketService.setBtcPrice(data.bitcoin)
    return true
  }

  @Get(':coin')
  @ApiOperation({ summary: 'Get the current market data of the selected coin' })
  @ApiParam({ name: 'coin', enum: ECoinType })
  async getEthMarketData(
    @Param('coin', new ParseEnumPipe(ECoinType)) coin: ECoinType,
  ) {
    return this.marketService.getMarketData(coin)
  }

  @Get('eth/history')
  @ApiOperation({
    summary: 'Get the current market history of the selected coin',
  })
  @ApiQuery({ name: 'period', enum: EPeriod })
  getEthHistoricalData(
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(ECoinType.ETHEREUM, period)
  }

  @Get('btc/history')
  @ApiOperation({
    summary: 'Get the current market history of the selected coin',
  })
  @ApiQuery({ name: 'period', enum: EPeriod })
  getBtcHistoricalData(
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(ECoinType.BITCOIN, period)
  }
}
