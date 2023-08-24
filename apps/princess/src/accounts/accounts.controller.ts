import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { UpdateShardsDto } from './dto/update-shards.dto'

import {
  AccountSwaggerResponse,
  CreateAccountDto,
} from './dto/create-account.dto'
import { DeleteAccountDto } from './dto/delete-account.dto'

@Controller('account')
@ApiTags('account')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  @Post('')
  @ApiOkResponse({ type: AccountSwaggerResponse })
  async createAccount(@Body() data: CreateAccountDto) {
    return await this.accountService.createAccount(
      data.provider,
      data.providerToken,
      data.otp,
      data.accountShard,
      data.iCloudShard,
      data.passcodeKey,
      data.recoveryKey,
      data.serverShard,
      data.vaultShard,
    )
  }

  @Patch('')
  async updateShards(@Body() data: UpdateShardsDto) {
    return await this.accountService.updateShards(data)
  }

  @Get('shards')
  async getShards() {
    return await this.accountService.getShards()
  }

  @Delete('')
  async deleteAccount(@Body() data: DeleteAccountDto) {
    return await this.accountService.deleteAccount(data.otp)
  }

  @Post('/signout')
  async signOut() {
    return await this.accountService.signOut()
  }
}
