import {
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Get,
  forwardRef,
  NotFoundException,
  Query,
} from '@nestjs/common'
import { WalletService } from './wallet.service'
import { AccountService } from '../account/account.service'
import { PortfolioService } from '../portfolio/portfolio.service'
import { IWalletType } from './wallet.types'
import { IWalletActiveData } from '../portfolio/portfolio.types'

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => PortfolioService))
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get(':id')
  async getHistory(@Param('id') id: number, @Query('period') period: string) {
    try {
      return await this.walletService.getUserWalletHistory({
        accountId: id,
        period,
      })
    } catch (e) {
      throw new InternalServerErrorException(e?.message)
    }
  }

  @Post(':address')
  async createPortfolio(
    @Param('address') address: string,
    @Body('account_id') account_id: number,
    @Body('account_id') type: IWalletType,
  ) {
    const account = await this.accountService.lookup({
      id: account_id,
    })
    if (!account) {
      throw new Error('Invalid account')
    }
    try {
      const res = await this.walletService.addNewWallet({
        account,
        address: address,
        type: type,
      })
      await this.portfolioService.initializeWallets()
      return res
    } catch (e) {
      throw new InternalServerErrorException(e?.message)
    }
  }

  @Post('activate')
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
