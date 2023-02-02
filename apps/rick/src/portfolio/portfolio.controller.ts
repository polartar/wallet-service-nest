import { BadRequestException, Controller, Get, Param } from '@nestjs/common'
import { WalletService } from '../wallet/wallet.service'

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly walletService: WalletService) {}
  @Get(':id')
  async login(@Param('id') id: number) {
    try {
      return await this.walletService.getUserWalletHistory({ accountId: id })
    } catch (e) {
      throw new BadRequestException(e?.message)
    }
  }
}
