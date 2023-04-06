import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { CreateWalletDto } from './dto/CreateWalletDto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('accounts')
@ApiTags('accounts')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  // we should validate the xPub
  @Post(':id/wallet')
  @ApiOperation({
    summary: 'Add the wallet to the account',
  })
  async createWallet(
    @Param('id') accountId: string,
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
      if (err.response) {
        throw new BadRequestException(err.response.data.message)
      } else {
        throw new BadRequestException('Rick server connection error')
      }
    }
  }
}
