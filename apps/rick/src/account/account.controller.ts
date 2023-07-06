import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  Put,
  Query,
} from '@nestjs/common'
import { AccountService } from './account.service'
import { CreateAccountDto } from './dto/create-account.dto'
import { AccountValidationPipe } from './account.pipe'
import * as Sentry from '@sentry/node'
import { UpdateAccountDto } from './dto/update-account.dto'
import { SyncAccountDto } from './dto/sync_account.dto'

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @UsePipes(new AccountValidationPipe())
  async createAccount(@Body() data: CreateAccountDto) {
    try {
      return await this.accountService.create(data)
    } catch (err) {
      Sentry.captureException(err, {
        extra: {
          message: err.message,
          email: data.email,
        },
      })
      throw new BadRequestException(err.message)
    }
  }

  @Put(':accountId')
  async updateAccount(
    @Body() data: UpdateAccountDto,
    @Param('accountId') accountId: string,
  ) {
    try {
      return await this.accountService.update(accountId, data)
    } catch (err) {
      Sentry.captureException(err, {
        extra: {
          message: err.message,
          email: data.email,
        },
      })
      throw new BadRequestException(err.message)
    }
  }

  @Get(':accountId')
  async getWallets(@Param('accountId') accountId: string) {
    return await this.accountService.getWallets(accountId)
  }

  @Get('/hash')
  async checkHash(@Query() query: SyncAccountDto): Promise<boolean> {
    return await this.accountService.checkHash(query.accountId, query.hash)
  }
}
