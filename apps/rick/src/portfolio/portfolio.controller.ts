import {
  InternalServerErrorException,
  NotFoundException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common'
import { WalletService } from '../wallet/wallet.service'
import { IWalletActiveData } from './portfolio.types'
import { PortfolioService } from './portfolio.service'

@Controller('portfolio')
export class PortfolioController {
  constructor(
    private readonly walletService: WalletService,
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get(':id')
  async getHistory(@Param('id') id: number) {
    try {
      return await this.walletService.getUserWalletHistory({ accountId: id })
    } catch (e) {
      throw new InternalServerErrorException(e?.message)
    }
  }

  @Post('active')
  async activeWallets(@Body() data: IWalletActiveData[]) {
    try {
      // need to get the account id from the logged in user in the future
      const accountId = 1
      const walletsActive = data.map((wallet) => ({ ...wallet, accountId }))
      const res = await this.walletService.updateWalletsActive(walletsActive)

      await this.portfolioService.initializeWallets()
      return res
    } catch (e) {
      throw new NotFoundException(e?.message)
    }
  }
}
