import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  UpdatePassCodeSwaggerResponse,
  UpdateShardsDto,
} from './dto/update-shartds.dto'
import {
  SwitchAccountSwaggerResponse,
  SwitchCloudSwaggerResponse,
  SwitchToCloudShardDto,
} from './dto/SwitchToCloudShardDto'
import {
  AccountSwaggerResponse,
  CreateAccountDto,
} from './dto/create-account.dto'
import { WalletSwaggerResponse } from '../wallet/dto/create-wallet.dto'

@Controller('account')
@ApiTags('account')
export class AccountsController {
  constructor(private readonly accountService: AccountsService) {}

  // @Get('')
  // @ApiOkResponse({ type: WalletSwaggerResponse })
  // async sync(@Query('hash') hash?: string) {
  //   return await this.accountService.syncAccount(hash)
  // }

  @Post('')
  @ApiOkResponse({ type: AccountSwaggerResponse })
  async createAccount(@Body() data: CreateAccountDto) {
    return await this.accountService.createAccount(
      data.provider,
      data.providerToken,
      data.otp,
      data.accountShard,
      data.iCloudshard,
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

  // @Put(':accountId')
  // @ApiOkResponse({ type: UpdatePassCodeSwaggerResponse })
  // @ApiOperation({
  //   summary: 'Update the passCodeKey',
  // })
  // async updatePassCode(
  //   @Param('accountId') accountId: number,
  //   @Body() data: UpdatePassCodeDto,
  // ) {
  //   return await this.accountService.updatePassCode(
  //     accountId,
  //     data.device_id,
  //     data.passcode_key,
  //   )
  // }

  // @Put(':accountId/switchToiCloudShard')
  // @ApiOkResponse({ type: SwitchCloudSwaggerResponse })
  // @ApiOperation({
  //   summary: 'Switch to Cloud',
  // })
  // async switchToCloud(
  //   @Param('accountId') accountId: number,
  //   @Body() data: SwitchToCloudShardDto,
  // ) {
  //   return await this.accountService.updateIsCloud(
  //     accountId,
  //     data.device_id,
  //     true,
  //   )
  // }

  // @Put(':accountId/switchToAccountShard')
  // @ApiOkResponse({ type: SwitchAccountSwaggerResponse })
  // @ApiOperation({
  //   summary: 'Switch to Account',
  // })
  // async switchToAccount(
  //   @Param('accountId') accountId: number,
  //   @Body() data: SwitchToCloudShardDto,
  // ) {
  //   return await this.accountService.updateIsCloud(
  //     accountId,
  //     data.device_id,
  //     false,
  //   )
  // }
}
