import {
  BadGatewayException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { CreateWalletDto } from './dto/CreateWalletDto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateWalletDto } from './dto/UpdateWalletDto'

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
}
