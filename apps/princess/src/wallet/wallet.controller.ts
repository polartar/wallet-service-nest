import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { WalletsService } from './wallet.service'
import {
  CreateWalletDto,
  WalletSwaggerResponse,
  WalletsSwaggerResponse,
} from './dto/create-wallet.dto'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateWalletDto } from './dto/UpdateWalletDto'
import { GetWalletDto } from './dto/get-wallet.dto'
import {
  UpdatePassCodeDto,
  UpdatePassCodeSwaggerResponse,
} from './dto/UpdatePassCodeDto'
import {
  SwitchWalletSwaggerResponse,
  SwitchCloudSwaggerResponse,
  SwitchToCloudShardDto,
} from './dto/SwitchToCloudShardDto'

@Controller('wallet')
@ApiTags('wallet')
export class WalletsController {
  constructor(private readonly walletService: WalletsService) {}

  @Get(':walletId/transactions')
  @ApiOkResponse({ type: WalletSwaggerResponse })
  @ApiOperation({
    summary:
      'Time series data, where date is timestamp (number), and the value of that date.',
  })
  async getWallet(
    @Param('walletId') walletId: number,
    @Query() query: GetWalletDto,
  ) {
    return await this.walletService.getWallet(walletId, query.period)
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

  // @Post(':walletId/wallet')
  // @ApiOkResponse({ type: WalletSwaggerResponse })
  // @ApiOperation({
  //   summary: 'Add the wallet to the wallet',
  // })
  // async createWallet(
  //   @Param('walletId') walletId: number,
  //   @Body() data: CreateWalletDto,
  // ) {
  //   return await this.walletService.createWallet(
  //     walletId,
  //     data.wallet_type,
  //     data.x_pub,
  //   )
  // }

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
