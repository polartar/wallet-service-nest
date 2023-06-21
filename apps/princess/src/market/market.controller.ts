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
import { EPeriod, ENetworks } from '@rana/core'
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

@Controller('market')
@ApiTags('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @ApiOperation({ summary: "This api can't be called directly" })
  @Post('price/eth')
  @Public()
  async setEthPrice(@Body() data: { ethereum: string }) {
    this.marketService.setEthPrice(data.ethereum)
    return true
  }

  @ApiOperation({ summary: "This api can't be called directly" })
  @Post('price/btc')
  @Public()
  async setBtcPrice(@Body() data: { bitcoin: string }) {
    this.marketService.setBtcPrice(data.bitcoin)
    return true
  }

  @Get(':coin')
  @ApiOkResponse({ type: CoinMarketSwaggerResponse })
  @ApiOperation({ summary: 'Get the current market data of the selected coin' })
  @ApiParam({ name: 'coin', enum: ENetworks })
  async getEthMarketData(
    @Param('coin', new ParseEnumPipe(ENetworks)) coin: ENetworks,
  ) {
    return this.marketService.getMarketData(coin)
  }

  @Get('eth/history')
  @ApiOkResponse({ type: CoinHistorySwaggerResponse })
  @ApiOperation({
    summary: 'Get the current market history of the selected coin',
  })
  @ApiQuery({ name: 'period', enum: EPeriod })
  getEthHistoricalData(
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(ENetworks.ETHEREUM, period)
  }

  @Get('btc/history')
  @ApiOkResponse({ type: CoinHistorySwaggerResponse })
  @ApiOperation({
    summary: 'Get the current market history of the selected coin',
  })
  @ApiQuery({ name: 'period', enum: EPeriod })
  getBtcHistoricalData(
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    return this.marketService.getHistoricalData(ENetworks.BITCOIN, period)
  }
}
