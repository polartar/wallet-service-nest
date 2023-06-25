import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { WalletsService } from './wallet.service'
import {
  CreateWalletDto,
  WalletSwaggerResponse,
  WalletsSwaggerResponse,
} from './dto/create-wallet.dto'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateWalletDto } from './dto/UpdateWalletDto'
import { GetWalletPortfolioDto } from './dto/get-wallet-portfolio.dto'
import {
  UpdatePassCodeDto,
  UpdatePassCodeSwaggerResponse,
} from './dto/UpdatePassCodeDto'
import {
  SwitchWalletSwaggerResponse,
  SwitchCloudSwaggerResponse,
  SwitchToCloudShardDto,
} from './dto/SwitchToCloudShardDto'
import { EPeriod, EWalletType } from '@rana/core'
import { GetWalletTransactionDto } from './dto/get-wallet-transaction.dto'

@Controller('wallet')
@ApiTags('wallet')
export class WalletsController {
  constructor(private readonly walletService: WalletsService) {}

  @Post('')
  @ApiOkResponse({ type: WalletSwaggerResponse })
  @ApiOperation({
    summary: 'Add the wallet to the account',
  })
  async createWallet(@Body() data: CreateWalletDto) {
    if (data.wallet_type !== EWalletType.VAULT) {
      this.walletService.createWallet(data)
    } else {
      this.walletService.sync(data.title, data.parts)
    }
  }

  @Get(':walletId/transactions')
  @ApiOkResponse({ type: WalletSwaggerResponse })
  @ApiOperation({
    summary:
      'Time series data, where date is timestamp (number), and the value of that date.',
  })
  async getWalletTransaction(
    @Param('walletId') walletId: number,
    @Query() query: GetWalletTransactionDto,
  ) {
    return await this.walletService.getWalletTransaction(
      walletId,
      query.start,
      query.count,
    )
  }

  @Get(':walletId/portfolio')
  @ApiOkResponse({ type: WalletSwaggerResponse })
  @ApiOperation({
    summary:
      'Time series data, where date is timestamp (number), and the value of that date.',
  })
  async getWalletPortfolio(
    @Param('walletId') walletId: number,
    @Query() query?: GetWalletPortfolioDto,
  ) {
    if (query && query.period) {
      return await this.walletService.getWalletPortfolio(walletId, query.period)
    } else {
      return await this.walletService.getWallet(walletId)
    }
  }

  @Get('')
  @ApiOkResponse({ type: WalletsSwaggerResponse })
  @ApiOperation({
    summary:
      'Time series data, where date is timestamp (number), and the value of that date.',
  })
  async getWallets() {
    return await this.walletService.getWallets()
  }

  @Patch(':walletId')
  @ApiOperation({
    summary: 'Update the wallet object',
  })
  async updateWallet(
    @Param('walletId') walletId: number,
    @Body() data: UpdateWalletDto,
  ) {
    if (!data.mnemonic && !data.title) {
      throw new BadRequestException('Should input at least title or mnemonic')
    } else if (data.mnemonic && data.title) {
      throw new BadRequestException('Should input one of title or mnemonic')
    }

    return await this.walletService.updateWallet(
      walletId,
      data.title,
      data.mnemonic,
    )
  }

  // @Post(':walletId/wallets/:walletId')
  // @ApiOperation({
  //   summary: 'Update the wallet object',
  // })
  // async updateWallet(
  //   @Param('walletId') walletId: number,
  //   @Param('walletId') walletId: string,
  //   @Body() data: UpdateWalletDto,
  // ) {
  //   return await this.walletService.updateWallet(walletId, walletId, data)
  // }

  // @Get(':walletId/wallets/:walletId/portfolio')
  // @ApiOkResponse({ type: PortfolioSwaggerResponse })
  // @ApiOperation({
  //   summary:
  //     'Time series data, where date is timestamp (number), and the value of that date.',
  // })
  // async getWalletPortfolio(
  //   @Param('walletId') walletId: number,
  //   @Param('walletId') walletId: number,
  //   @Query() query: GetPortfolioDto,
  // ) {
  //   return await this.walletService.getWalletPortfolio(
  //     walletId,
  //     walletId,
  //     query.period,
  //   )
  // }

  // @Put(':walletId')
  // @ApiOkResponse({ type: UpdatePassCodeSwaggerResponse })
  // @ApiOperation({
  //   summary: 'Update the passCodeKey',
  // })
  // async updatePassCode(
  //   @Param('walletId') walletId: number,
  //   @Body() data: UpdatePassCodeDto,
  // ) {
  //   return await this.walletService.updatePassCode(
  //     walletId,
  //     data.device_id,
  //     data.passcode_key,
  //   )
  // }

  // @Put(':walletId/switchToiCloudShard')
  // @ApiOkResponse({ type: SwitchCloudSwaggerResponse })
  // @ApiOperation({
  //   summary: 'Switch to Cloud',
  // })
  // async switchToCloud(
  //   @Param('walletId') walletId: number,
  //   @Body() data: SwitchToCloudShardDto,
  // ) {
  //   return await this.walletService.updateIsCloud(
  //     walletId,
  //     data.device_id,
  //     true,
  //   )
  // }

  // @Put(':walletId/switchToWalletShard')
  // @ApiOkResponse({ type: SwitchWalletSwaggerResponse })
  // @ApiOperation({
  //   summary: 'Switch to Wallet',
  // })
  // async switchToWallet(
  //   @Param('walletId') walletId: number,
  //   @Body() data: SwitchToCloudShardDto,
  // ) {
  //   return await this.walletService.updateIsCloud(
  //     walletId,
  //     data.device_id,
  //     false,
  //   )
  // }
}
