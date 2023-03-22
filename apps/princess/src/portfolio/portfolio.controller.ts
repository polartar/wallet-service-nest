import { PortfolioService } from './portfolio.service'
import { IUpdatedAddressesInput } from './portfolio.types'
import { Body, Controller, Post } from '@nestjs/common'

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('updated')
  async updatedAddresses(@Body() data: IUpdatedAddressesInput) {
    this.portfolioService.updatedAddresses(data.updatedAddresses)
  }
}
