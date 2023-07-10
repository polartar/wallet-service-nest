import {
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Get,
  forwardRef,
  Query,
  ParseEnumPipe,
  BadRequestException,
  Patch,
  Delete,
} from '@nestjs/common'
import { WalletService } from './wallet.service'
import { PortfolioService } from '../portfolio/portfolio.service'
import { IWalletActiveData } from '../portfolio/portfolio.types'
import { EPeriod, EWalletType } from '@rana/core'
import * as Sentry from '@sentry/node'
import { AddXPubs } from './dto/add-xpubs'
import { CombineWalletDto } from './dto/combine-wallet.dto'
import { CreateWalletDto } from './dto/create-wallet.dto'
import { UpdateWalletDto } from './dto/update-wallet.dto'

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => PortfolioService))
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get('')
  async getWallets(@Query('accountId') accountId: string) {
    try {
      return await this.walletService.getWallets(accountId)
    } catch (e) {
      Sentry.captureException(e.message + ' in getWallets')

      throw new InternalServerErrorException(e?.message)
    }
  }

  // Need to confirm if we need to verify account Id
  @Get(':walletId')
  async getWallet(
    @Query('accountId') accountId: string,
    @Param('walletId') walletId: string,
    // @Query('period', new ParseEnumPipe(EPeriod)) period: EPeriod,
  ) {
    try {
      return await this.walletService.getWallet(accountId, walletId)
    } catch (e) {
      Sentry.captureException(e.message + ' in getWalletHistory')

      throw new InternalServerErrorException(e?.message)
    }
  }

  @Get(':walletId/transactions')
  async getWalletTransaction(
    @Param('walletId') walletId: string,
    @Query('accountId') accountId: string,
    @Query('start') start: number,
    @Query('count') count: number,
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

  @Get(':walletId/portfolio')
  async getWalletPortfolio(
    @Param('walletId') walletId: string,
    @Query('accountId') accountId: string,
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

  @Post('')
  async createWallet(@Body() data: CreateWalletDto) {
    const res = await this.walletService.addNewWallet(
      data.accountId,
      data.title,
      data.mnemonic,
      data.assetIds,
    )

    await this.portfolioService.updateCurrentWallets()
    return res
  }

  @Patch(':walletId')
  async updateWallet(
    @Param('walletId') walletId: string,
    @Body() data: UpdateWalletDto,
  ) {
    return await this.walletService.updateWallet(
      walletId,
      data.accountId,
      data.title,
      data.mnemonic,
    )
  }

  @Delete(':walletId')
  async deleteWallet(
    @Param('walletId') walletId: string,
    @Body('accountId') accountId: string,
  ) {
    try {
      return await this.walletService.deleteWallet(walletId, accountId)
    } catch (e) {
      Sentry.captureException(e.message + ' in getHistory()')

      throw new InternalServerErrorException(e?.message)
    }
  }

  // @Post('')
  // async createPortfolio(
  //   @Body('xPub') xPub: string,
  //   @Body('account_id',) account_id: number,
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

  //     await this.portfolioService.updateCurrentWallets()
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

  //     await this.portfolioService.updateCurrentWallets()
  //     return res
  //   } catch (e) {
  //     Sentry.captureException(e.message + ' in updateWalletActive()')

  //     throw new NotFoundException(e?.message)
  //   }
  // }

  @Post('vault')
  async AddXPubs(@Body() data: AddXPubs) {
    const res = await this.walletService.addVaultCoins(
      data.title,
      data.accountId,
      data.coins,
    )

    await this.portfolioService.updateCurrentWallets()
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
