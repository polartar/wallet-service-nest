import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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
  async createAccount(@Body() data: CreateAccountDto) {
    try {
      return await this.accountService.create(data)
    } catch (err) {
      Sentry.captureException(`${err.message} with ${data.email}`)
      throw new BadRequestException(err.message)
    }
  }

  @Get(':id')
  async getAccount(@Param('id', ParseIntPipe) id: number) {
    return await this.accountService.lookup({ id })
  }
}
