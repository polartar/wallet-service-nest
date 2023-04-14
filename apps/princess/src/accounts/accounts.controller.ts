import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { CreateWalletDto } from './dto/CreateWalletDto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateWalletDto } from './dto/UpdateWalletDto'
import { GetPortfolioDto } from './dto/GetPortfolioDto'
import { UpdatePassCodeDto } from './dto/UpdatePassCodeDto'
import { SwitchToCloudShardDto } from './dto/SwitchToCloudShardDto'
import { EPeriod } from '@rana/core'
import { CreateAccountDto } from './dto/CreateAccountDto'

@Controller('accounts')
@ApiTags('accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  // we should validate the xPub
  @Post(':accountId/wallet')
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
  @ApiOperation({
    summary:
      'Timeseries data, where date is timestamp (number), and the value of that date.',
  })
  async getPortfolio(
    @Param('accountId') accountId: number,
    @Query() query: GetPortfolioDto,
  ) {
    return await this.accountService.getPortfolio(accountId, query.period)
  }

  @Get(':accountId/wallets/:walletId/portfolio')
  @ApiOperation({
    summary:
      'Timeseries data, where date is timestamp (number), and the value of that date.',
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
  @ApiOperation({
    summary: 'Update pass code key',
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
  @ApiOperation({
    summary: 'Switch to Cloud',
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

  @Post('')
  @ApiOperation({
    summary: 'Create account(testing purpose)',
  })
  async createAccount(@Body() data: CreateAccountDto) {
    try {
      const response = await this.accountService.createAccount(
        data.email,
        data.name,
      )
      return response
    } catch (err) {
      const message = err.response
        ? err.response.data.message
        : 'Rick server connection error'
      throw new BadGatewayException(message)
    }
  }
}
