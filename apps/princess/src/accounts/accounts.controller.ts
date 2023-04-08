import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { CreateWalletDto } from './dto/CreateWalletDto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateWalletDto } from './dto/UpdateWalletDto'
import { GetPortfolioDto } from './dto/GetPortfolioDto'

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
    try {
      const response = await this.accountService.createWallet(
        accountId,
        data.wallet_type,
        data.x_pub,
      )
      return response
    } catch (err) {
      const message = err.response
        ? err.response.data.message
        : 'Rick server connection error'
      throw new BadGatewayException(message)
    }
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
    try {
      const response = await this.accountService.updateWallet(
        accountId,
        walletId,
        data,
      )
      return response
    } catch (err) {
      const message = err.response
        ? err.response.data.message
        : 'Rick server connection error'
      throw new BadGatewayException(message)
    }
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
    try {
      const response = await this.accountService.getPortfolio(
        accountId,
        query.period,
      )
      return response
    } catch (err) {
      if (err.response) {
        throw new InternalServerErrorException(
          'Something went wrong in Rick API',
        )
      }
      throw new BadGatewayException('Rick server connection error')
    }
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
    try {
      const response = await this.accountService.getWalletPortfolio(
        accountId,
        walletId,
        query.period,
      )
      return response
    } catch (err) {
      if (err.response) {
        throw new InternalServerErrorException(
          'Something went wrong in Rick API',
        )
      }
      throw new BadGatewayException('Rick server connection error')
    }
  }
}
