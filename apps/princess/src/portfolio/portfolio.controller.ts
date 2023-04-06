import { EPortfolioType } from '@rana/core'
import { PortfolioService } from './portfolio.service'
import { IUpdatedAddress } from './portfolio.types'
import { Body, Controller, ParseEnumPipe, Post } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // need to add the restriction so that is should be called by only rick
  @Post('updated')
  @ApiOperation({ summary: "This api can't be called directly" })
  async updatedAddresses(
    @Body('type', new ParseEnumPipe(EPortfolioType)) type: EPortfolioType,
    @Body('data') data: IUpdatedAddress[],
  ) {
    this.portfolioService.handleUpdatedAddresses(type, data)
  }
}
