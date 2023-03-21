import { PortfolioService } from './portfolio.service'
import { IAddress } from './portfolio.types'
import { Body, Controller, Post } from '@nestjs/common'

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('updated')
  async updatedWallets(@Body() data: IAddress[]) {
    this.portfolioService.updateWallets(data)
  }
}
