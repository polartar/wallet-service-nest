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
  ParseIntPipe,
  ParseEnumPipe,
  BadRequestException,
} from '@nestjs/common'
import { WalletService } from './wallet.service'
import { AccountService } from '../account/account.service'
import { PortfolioService } from '../portfolio/portfolio.service'
import { IWalletActiveData } from '../portfolio/portfolio.types'
import { EPeriod, EWalletType } from '@rana/core'

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => PortfolioService))
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get(':accountId')
  async getHistory(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    try {
      return await this.walletService.getUserHistory(accountId, period)
    } catch (e) {
      throw new InternalServerErrorException(e?.message)
    }
  }

  @Post(':xPub')
  async createPortfolio(
    @Param('xPub') xPub: string,
    @Body('account_id', ParseIntPipe) account_id: number,
    @Body('wallet_type', new ParseEnumPipe(EWalletType))
    walletType: EWalletType,
  ) {
    const account = await this.accountService.lookup({
      id: account_id,
    })
    if (!account) {
      throw new BadRequestException('Invalid account id')
    }
    try {
      const res = await this.walletService.addNewWallet({
        account,
        xPub,
        walletType,
      })
      await this.portfolioService.initializeWallets()
      return res
    } catch (e) {
      throw new BadRequestException(e.message)
    }
  }

  @Post('activate')
  async activeWallet(@Body() data: IWalletActiveData) {
    try {
      // need to validate the wallet id and authorized account later
      const res = await this.walletService.updateWalletsActive(data)

      await this.portfolioService.initializeWallets()
      return res
    } catch (e) {
      throw new NotFoundException(e?.message)
    }
  }

  @Get(':accountId/wallet/:walletId')
  async getWalletHistory(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('walletId', ParseIntPipe) walletId: number,
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    try {
      return await this.walletService.getUserWalletHistory(
        accountId,
        walletId,
        period,
      )
    } catch (e) {
      throw new InternalServerErrorException(e?.message)
    }
  }
}
