import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { CreateAccountDto } from './dto/create-account.dto'
import { AccountService } from './account.service'

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async createAccount(@Body() data: CreateAccountDto) {
    try {
      let account = await this.accountService.lookup({ email: data.email })

      if (account) {
        account = await this.accountService.create(data)
      }

      return account
    } catch (e) {
      throw new BadRequestException(e?.message)
    }
  }
}
