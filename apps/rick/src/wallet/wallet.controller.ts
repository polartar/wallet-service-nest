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
import { PortfolioService } from '../portfolio/portfolio.service'
import { IWalletActiveData } from '../portfolio/portfolio.types'
import { EPeriod, EWalletType } from '@rana/core'
import * as Sentry from '@sentry/node'
import { AddXPubs } from './dto/add-xpubs'
import { CombineWalletDto } from './dto/combine-wallet.dto'

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
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
      Sentry.captureException(e.message + ' in getHistory()')

      throw new InternalServerErrorException(e?.message)
    }
  }

  @Post('')
  async createPortfolio(
    @Body('xPub') xPub: string,
    @Body('account_id', ParseIntPipe) account_id: number,
    @Body('wallet_type', new ParseEnumPipe(EWalletType))
    walletType: EWalletType,
  ) {
    try {
      const res = await this.walletService.addNewWallet(
        account_id,
        xPub,
        walletType,
      )
      await this.portfolioService.initializeWallets()
      return res
    } catch (e) {
      Sentry.captureException(e.message + ' while addNewWallet')

      throw new BadRequestException(e.message)
    }
  }

  @Post('activate')
  async activeWallet(@Body() data: IWalletActiveData) {
    try {
      const res = await this.walletService.updateWalletActive(data)

      await this.portfolioService.initializeWallets()
      return res
    } catch (e) {
      Sentry.captureException(e.message + ' in updateWalletActive()')

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
      Sentry.captureException(e.message + ' in getWalletHistory')

      throw new InternalServerErrorException(e?.message)
    }
  }

  @Post('xpubs')
  async AddXPubs(@Body() data: AddXPubs) {
    const res = await this.walletService.addXPubs(data.accountId, data.xpubs)

    await this.portfolioService.initializeWallets()
    return res
  }

  @Post('combine')
  async combineWallets(@Body() data: CombineWalletDto) {
    return await this.walletService.combineWallets(
      data.existingAccountId,
      data.anonymousId,
    )
  }
}
