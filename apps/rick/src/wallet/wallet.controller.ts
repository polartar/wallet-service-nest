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
  Patch,
  Delete,
} from '@nestjs/common'
import { WalletService } from './wallet.service'
import { PortfolioService } from '../portfolio/portfolio.service'
import { ENetworks, EPeriod } from '@rana/core'
import * as Sentry from '@sentry/node'
import { AddXPubs } from './dto/add-xpubs'
import { CombineWalletDto } from './dto/combine-wallet.dto'
import { CreateWalletDto } from './dto/create-wallet.dto'
import { UpdateWalletDto } from './dto/update-wallet.dto'
import { SignOutWalletsDto } from './dto/signout-wallet.dto'

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

  @Get(':walletId')
  async getWallet(
    @Query('accountId') accountId: string,
    @Param('walletId') walletId: string,
  ) {
    return await this.walletService.getWallet(accountId, walletId)
  }

  @Get(':walletId/transactions')
  async getWalletTransaction(
    @Param('walletId') walletId: string,
    @Query('accountId') accountId: string,
  ) {
    try {
      return await this.walletService.getUserWalletTransaction(
        accountId,
        walletId,
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
    @Query('networks') networks: string,
  ) {
    try {
      return await this.walletService.getUserWalletPortfolio(
        accountId,
        walletId,
        period,
        networks,
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

  @Delete(':walletId/:accountId')
  async deleteWallet(
    @Param('walletId') walletId: string,
    @Param('accountId') accountId: string,
  ) {
    return await this.walletService.deleteWallet(walletId, accountId)
  }

  @Delete('account/:accountId/:deviceId')
  async deleteWallets(
    @Param('deviceId') deviceId: string,
    @Param('accountId') accountId: string,
  ) {
    return await this.walletService.deleteWallets(accountId, deviceId)
  }

  @Post('vault')
  async AddXPubs(@Body() data: AddXPubs) {
    const res = await this.walletService.addVaultCoins(
      data.title,
      data.accountId,
      data.coins,
    )

    return res
  }

  @Post('combine')
  async combineWallets(@Body() data: CombineWalletDto) {
    return await this.walletService.combineWallets(
      data.existingAccountId,
      data.anonymousId,
    )
  }

  @Patch(':walletId/asset')
  async addAsset(
    @Param('walletId') walletId: string,
    @Body() data: { accountId: string; assetId: string },
  ) {
    return await this.walletService.addAsset(
      walletId,
      data.accountId,
      data.assetId,
    )
  }

  @Post('signout')
  async signOut(@Body() data: SignOutWalletsDto) {
    return await this.walletService.signOut(
      data.email,
      data.name,
      data.accountId,
      data.newAccountId,
    )
  }

  @Post('confirm-balances')
  async confirmBalances() {
    await this.walletService.confirmWalletBalances()
  }

  @Post('confirm-balance')
  async confirmAddressBalance(
    @Body() data: { address: string; network: ENetworks },
  ) {
    await this.walletService.confirmAddressBalance(data.address, data.network)
  }
}
