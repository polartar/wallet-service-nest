import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { AccountService } from './account.service'
import { CreateAccountDto } from './dto/create-account.dto'

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async createAccount(@Body() data: CreateAccountDto) {
    return await this.accountService.create(data)
  }

  @Get(':id')
  async getAccount(@Param('id') id: number) {
    return await this.accountService.lookup({ id })
  }
}
