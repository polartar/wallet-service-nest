import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common'
import { IWalletCreation } from './accounts.types'
import { AccountsService } from './accounts.service'

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  // we should validate the xPub
  @Post(':id/wallet')
  async createWallet(
    @Param('id') accountId: string,
    @Body() data: IWalletCreation,
  ) {
    try {
      const response = await this.accountService.createWallet(
        accountId,
        data.wallet_type,
        data.x_pub,
      )
      return response
    } catch (err) {
      throw new BadRequestException(err.response.data.message)
    }
  }
}
