import { EPortfolioType } from '@rana/core'
import { PortfolioService } from './portfolio.service'
import {
  ITransactionWebhookData,
  IUpdatedAssets,
  IWebhookData,
} from './portfolio.types'
import { Body, Controller, ParseEnumPipe, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../gateway/decorators/public.decorator'

@Controller('portfolio')
@ApiTags('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('updated')
  @ApiOperation({ summary: "This api can't be called directly" })
  async updatedAddresses(
    @Body('type', new ParseEnumPipe(EPortfolioType)) type: EPortfolioType,
    @Body('data') data: IUpdatedAssets[],
  ) {
    this.portfolioService.handleUpdatedAddresses(type, data)
  }

  @Post('webhook/:network')
  @Public()
  @ApiOperation({ summary: "This api can't be called directly" })
  async handleWebhook(
    @Body('') data: IWebhookData,
    // @Param('network') network: string,
  ) {
    this.portfolioService.handleWebhook(data)
  }

  @Post('transaction-webhook')
  @Public()
  @ApiOperation({ summary: "This api can't be called directly" })
  async handleTransactionWebhook(@Body('') data: ITransactionWebhookData) {
    this.portfolioService.handleTransactionWebhook(data)
  }
}
