import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { CreateWalletDto, WalletSwaggerResponse } from './dto/CreateWalletDto'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateWalletDto } from './dto/UpdateWalletDto'
import {
  GetPortfolioDto,
  PortfolioSwaggerResponse,
} from './dto/GetPortfolioDto'
import {
  UpdatePassCodeDto,
  UpdatePassCodeSwaggerResponse,
} from './dto/UpdatePassCodeDto'
import {
  SwitchAccountSwaggerResponse,
  SwitchCloudSwaggerResponse,
  SwitchToCloudShardDto,
} from './dto/SwitchToCloudShardDto'

@Controller('account')
@ApiTags('account')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  @Get('')
  @ApiOkResponse({ type: PortfolioSwaggerResponse })
  async sync(@Query('hash') hash?: string) {
    return await this.accountService.syncAccount(hash)
  }

  @Post(':accountId/wallet')
  @ApiOkResponse({ type: WalletSwaggerResponse })
  @ApiOperation({
    summary: 'Add the wallet to the account',
  })
  async createWallet(
    @Param('accountId') accountId: number,
    @Body() data: CreateWalletDto,
  ) {
    return await this.accountService.createWallet(
      accountId,
      data.wallet_type,
      data.x_pub,
    )
  }

  @Post(':accountId/wallets/:walletId')
  @ApiOperation({
    summary: 'Update the wallet object',
  })
  async updateWallet(
    @Param('accountId') accountId: number,
    @Param('walletId') walletId: string,
    @Body() data: UpdateWalletDto,
  ) {
    return await this.accountService.updateWallet(accountId, walletId, data)
  }

  @Get(':accountId/portfolio')
  @ApiOkResponse({ type: PortfolioSwaggerResponse })
  @ApiOperation({
    summary:
      'Time series data, where date is timestamp (number), and the value of that date.',
  })
  async getPortfolio(
    @Param('accountId') accountId: number,
    @Query() query: GetPortfolioDto,
  ) {
    return await this.accountService.getPortfolio(accountId, query.period)
  }

  @Get(':accountId/wallets/:walletId/portfolio')
  @ApiOkResponse({ type: PortfolioSwaggerResponse })
  @ApiOperation({
    summary:
      'Time series data, where date is timestamp (number), and the value of that date.',
  })
  async getWalletPortfolio(
    @Param('accountId') accountId: number,
    @Param('walletId') walletId: number,
    @Query() query: GetPortfolioDto,
  ) {
    return await this.accountService.getWalletPortfolio(
      accountId,
      walletId,
      query.period,
    )
  }

  @Put(':accountId')
  @ApiOkResponse({ type: UpdatePassCodeSwaggerResponse })
  @ApiOperation({
    summary: 'Update the passCodeKey',
  })
  async updatePassCode(
    @Param('accountId') accountId: number,
    @Body() data: UpdatePassCodeDto,
  ) {
    return await this.accountService.updatePassCode(
      accountId,
      data.device_id,
      data.passcode_key,
    )
  }

  @Put(':accountId/switchToiCloudShard')
  @ApiOkResponse({ type: SwitchCloudSwaggerResponse })
  @ApiOperation({
    summary: 'Switch to Cloud',
  })
  async switchToCloud(
    @Param('accountId') accountId: number,
    @Body() data: SwitchToCloudShardDto,
  ) {
    return await this.accountService.updateIsCloud(
      accountId,
      data.device_id,
      true,
    )
  }

  @Put(':accountId/switchToAccountShard')
  @ApiOkResponse({ type: SwitchAccountSwaggerResponse })
  @ApiOperation({
    summary: 'Switch to Account',
  })
  async switchToAccount(
    @Param('accountId') accountId: number,
    @Body() data: SwitchToCloudShardDto,
  ) {
    return await this.accountService.updateIsCloud(
      accountId,
      data.device_id,
      false,
    )
  }
}
