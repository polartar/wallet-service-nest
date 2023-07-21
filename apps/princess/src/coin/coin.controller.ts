import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
} from '@nestjs/common'
import { CoinService } from './coin.service'
import { EPeriod, ECoinTypes } from '@rana/core'
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { Public } from '../gateway/decorators/public.decorator'
import { CoinMarketSwaggerResponse } from './dto/coin-market.dto'
import { CoinHistorySwaggerResponse } from './dto/coin-history.dto'

@Controller('coin')
@ApiTags('coin')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @ApiOperation({ summary: "This api can't be called directly" })
  @Post('price/eth')
  @Public()
  async setEthPrice(@Body() data: { ethereum: string }) {
    this.coinService.setEthPrice(data.ethereum)
    return true
  }

  @ApiOperation({ summary: "This api can't be called directly" })
  @Post('price/btc')
  @Public()
  async setBtcPrice(@Body() data: { bitcoin: string }) {
    this.coinService.setBtcPrice(data.bitcoin)
    return true
  }

  @Get(':coinType/market')
  @ApiOkResponse({ type: CoinMarketSwaggerResponse })
  @ApiOperation({ summary: 'Get the current market data of the selected coin' })
  @ApiParam({ name: 'coinType', enum: ECoinTypes })
  async getEthMarketData(
    @Param('coinType', new ParseEnumPipe(ECoinTypes)) coinType: ECoinTypes,
  ) {
    return this.coinService.getMarketData(coinType)
  }

  @Get(':coinType/portfolio')
  @ApiOkResponse({ type: CoinHistorySwaggerResponse })
  @ApiOperation({
    summary: 'Get the current market history of the selected coin',
  })
  @ApiParam({ name: 'coinType', enum: ECoinTypes })
  @ApiQuery({ name: 'period', enum: EPeriod })
  getEthHistoricalData(
    @Param('coinType', new ParseEnumPipe(ECoinTypes)) coinType: ECoinTypes,
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.coinService.getHistoricalData(coinType, period)
  }
}
