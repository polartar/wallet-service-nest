import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Headers,
  UsePipes,
} from '@nestjs/common'
import { AccountService } from './account.service'
import { CreateAccountDto } from './dto/create-account.dto'
import { AccountValidationPipe } from './account.pipe'
import * as Sentry from '@sentry/node'

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @UsePipes(new AccountValidationPipe())
  async createAccount(
    @Body() data: CreateAccountDto,
    @Headers() headers: Headers,
  ) {
    const sentry_trace_data = Sentry.extractTraceparentData(
      headers.get('sentry-trace'),
    )
    const sentry_txn = Sentry.startTransaction({
      op: 'createAccount',
      name: 'createAccount in rick',
      ...sentry_trace_data,
    })
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
    } finally {
      sentry_txn.finish()
    }
  }

  @Get(':accountId')
  async getAccount(@Param('accountId', ParseIntPipe) accountId: number) {
    return await this.accountService.lookup({ accountId })
  }
}
