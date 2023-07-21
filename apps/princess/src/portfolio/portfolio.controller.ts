import { EPortfolioType } from '@rana/core'
import { PortfolioService } from './portfolio.service'
import { IUpdatedAssets } from './portfolio.types'
import { Body, Controller, ParseEnumPipe, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

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
}
