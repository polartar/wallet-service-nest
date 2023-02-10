import { PortfolioService } from './portfolio.service'
import { IWallet } from './portfolio.types'
import { Body, Controller, Post } from '@nestjs/common'

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('updated')
  async updatedWallets(@Body() data: IWallet[]) {
    this.portfolioService.updateWallets(data)
  }
}
