import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common'
import { AccountService } from './account.service'
import { CreateAccountDto } from './dto/create-account.dto'
import { AccountValidationPipe } from './account.pipe'

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @UsePipes(new AccountValidationPipe())
  async createAccount(@Body() data: CreateAccountDto) {
    try {
      return await this.accountService.create(data)
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }

  @Get(':id')
  async getAccount(@Param('id') id: number) {
    return await this.accountService.lookup({ id })
  }
}
