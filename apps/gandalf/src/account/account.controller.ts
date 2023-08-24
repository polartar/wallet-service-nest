import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { CreateAccountDto } from './dto/create-account.dto'
import { AccountService } from './account.service'
import { UpdateShardsDto } from './dto/update-account.dto'

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async createAccount(@Body() data: CreateAccountDto) {
    try {
      let account = await this.accountService.lookup({ email: data.email })

      if (!account) {
        account = await this.accountService.create(data)
      }
      return account
    } catch (e) {
      throw new BadRequestException(e?.message)
    }
  }

  @Get(':accountId')
  async getAccount(@Param('accountId') accountId: string) {
    return this.accountService.getAccount(accountId)
  }

  @Patch(':accountId')
  async updateShards(
    @Param('accountId') accountId: string,
    @Body() data: UpdateShardsDto,
  ) {
    return this.accountService.updateShards(accountId, data)
  }

  @Delete(':accountId/:deviceId')
  async deleteAccount(
    @Param('accountId') accountId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return this.accountService.deleteAccount(accountId, deviceId)
  }
}
