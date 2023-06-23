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
import { CreateWalletDto } from './dto/create-wallet.dto'

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => PortfolioService))
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get(':accountId/wallet/:walletId')
  async getWallet(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('walletId', ParseIntPipe) walletId: number,
    // @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    try {
      return await this.walletService.getWallet(accountId, walletId)
    } catch (e) {
      Sentry.captureException(e.message + ' in getWalletHistory')

      throw new InternalServerErrorException(e?.message)
    }
  }

  @Get(':accountId/wallet/:walletId/transactions')
  async getWalletTransaction(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('walletId', ParseIntPipe) walletId: number,
    @Query('start') start?: number,
    @Query('count') count?: number,
  ) {
    try {
      return await this.walletService.getUserWalletTransaction(
        accountId,
        walletId,
        start,
        count,
      )
    } catch (e) {
      Sentry.captureException(e.message + ' in getWalletHistory')

      throw new InternalServerErrorException(e?.message)
    }
  }

  @Get(':accountId/wallet/:walletId/portfolio')
  async getWalletPortfolio(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Param('walletId', ParseIntPipe) walletId: number,
    @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    try {
      return await this.walletService.getUserWalletPortfolio(
        accountId,
        walletId,
        period,
      )
    } catch (e) {
      Sentry.captureException(e.message + ' in getWalletHistory')

      throw new InternalServerErrorException(e?.message)
    }
  }

  @Get(':accountId')
  async getWallets(@Param('accountId', ParseIntPipe) accountId: number) {
    try {
      return await this.walletService.getWallets(accountId)
    } catch (e) {
      Sentry.captureException(e.message + ' in getHistory()')

      throw new InternalServerErrorException(e?.message)
    }
  }

  @Post('')
  async createWallet(@Body() data: CreateWalletDto) {
    try {
      const res = await this.walletService.addNewWallet(
        data.accountId,
        data.title,
        data.mnemonic,
        data.assetIds,
        data.walletType,
      )

      await this.portfolioService.initializeWallets()
      return res
    } catch (e) {
      Sentry.captureException(e.message + ' while addNewWallet')

      throw new BadRequestException(e.message)
    }
  }

  // @Post('')
  // async createPortfolio(
  //   @Body('xPub') xPub: string,
  //   @Body('account_id', ParseIntPipe) account_id: number,
  //   @Body('wallet_type', new ParseEnumPipe(EWalletType))
  //   walletType: EWalletType,
  //   @Body('title') title?: string,
  // ) {
  //   try {
  //     const res = await this.walletService.addNewWallet(
  //       account_id,
  //       xPub,
  //       walletType,
  //       title,
  //     )

  //     await this.portfolioService.initializeWallets()
  //     return res
  //   } catch (e) {
  //     Sentry.captureException(e.message + ' while addNewWallet')

  //     throw new BadRequestException(e.message)
  //   }
  // }

  // @Post('activate')
  // async activeWallet(@Body() data: IWalletActiveData) {
  //   try {
  //     const res = await this.walletService.updateWalletActive(data)

  //     await this.portfolioService.initializeWallets()
  //     return res
  //   } catch (e) {
  //     Sentry.captureException(e.message + ' in updateWalletActive()')

  //     throw new NotFoundException(e?.message)
  //   }
  // }

  @Post('xpubs')
  async AddXPubs(@Body() data: AddXPubs) {
    const res = await this.walletService.addXPubs(
      data.title,
      data.accountId,
      data.xpubs,
    )

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
