import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
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
    @Param('accountId') accountId: string,
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
    @Param('accountId') accountId: string,
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
}
