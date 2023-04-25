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
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { Public } from '../auth/decorators/public.decorator'
import { CoinMarketResponse } from './dto/CoinMarketDto'
import { CoinHistoryResponse } from './dto/CoinHistoryDto'

@Controller('market')
@ApiTags('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @ApiOperation({ summary: "This api can't be called directly" })
  @Post('ethereum')
  @Public()
  async setEthPrice(@Body() data: { ethereum: string }) {
    this.marketService.setEthPrice(data.ethereum)
    return true
  }

  @ApiOperation({ summary: "This api can't be called directly" })
  @Post('bitcoin')
  @Public()
  async setBtcPrice(@Body() data: { bitcoin: string }) {
    this.marketService.setBtcPrice(data.bitcoin)
    return true
  }

  @Get(':coin')
  @ApiOkResponse({ type: CoinMarketResponse })
  @ApiOperation({ summary: 'Get the current market data of the selected coin' })
  @ApiParam({ name: 'coin', enum: ECoinType })
  async getEthMarketData(
    @Param('coin', new ParseEnumPipe(ECoinType)) coin: ECoinType,
  ) {
    return this.marketService.getMarketData(coin)
  }

  @Get('eth/history')
  @ApiOkResponse({ type: CoinHistoryResponse })
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
  @ApiOkResponse({ type: CoinHistoryResponse })
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
