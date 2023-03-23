import { EPortfolioType } from '@rana/core'
import { PortfolioService } from './portfolio.service'
import { IUpdatedAddress } from './portfolio.types'
import { Body, Controller, ParseEnumPipe, Post } from '@nestjs/common'

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('updated')
  async updatedAddresses(
    @Body('type', new ParseEnumPipe(EPortfolioType)) type: EPortfolioType,
    @Body('data') data: IUpdatedAddress[],
  ) {
    this.portfolioService.handleUpdatedAddresses(type, data)
  }
}
