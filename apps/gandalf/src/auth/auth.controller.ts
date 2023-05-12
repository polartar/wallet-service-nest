import { AuthService } from './auth.service'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  InternalServerErrorException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common'
import { IAuthData } from './auth.types'
import { LoginValidationPipe } from './auth.pipe'
import { AccountService } from '../account/account.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  @Post()
  @UsePipes(new LoginValidationPipe())
  async auth(@Body() data: IAuthData, @Headers() headers: Headers) {
    try {
      const { name, email } = await this.authService.authorize(data, headers)
      let account = await this.accountService.lookup({ email })

      if (account) {
        return {
          is_new: false,
          account,
        }
      } else {
        account = await this.accountService.getAccount(data.accountId)
        console.log({ account })
        await this.accountService.update(account, { name, email })

        return {
          is_new: true,
          account: account,
        }
      }
    } catch (e) {
      throw new BadRequestException(e?.message)
    }
  }

  @Get('/:account_id')
  async getAccount(@Param('account_id') accountId: number) {
    try {
      return this.accountService.getAccount(accountId)
    } catch (e) {
      throw new InternalServerErrorException(e?.message)
    }
  }
}
