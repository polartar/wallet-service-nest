import { AuthService } from './auth.service'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common'
import { IAuthData } from './auth.types'
import { LoginValidationPipe } from './auth.pipe'
import { AccountService } from '../account/account.service'
import * as Sentry from '@sentry/node'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  @Post()
  @UsePipes(new LoginValidationPipe())
  async auth(@Body() data: IAuthData) {
    try {
      const { name, email } = await this.authService.authorize(data)
      let account = await this.accountService.lookup({ email })

      if (account) {
        return {
          is_new: false,
          account,
        }
      } else if (data.accountId) {
        account = await this.accountService.getAccount(data.accountId)

        await this.accountService.update(account, { name, email })

        return {
          is_new: true,
          account: account,
        }
      } else {
        throw new Error('User not exists')
      }
    } catch (e) {
      Sentry.captureMessage(`Auth(): ${e.message}`)
      throw new BadRequestException(e?.message)
    }
  }

  @Get('/:accountId')
  async getAccount(@Param('accountId') accountId: string) {
    try {
      return this.accountService.getAccount(accountId)
    } catch (e) {
      throw new InternalServerErrorException(e?.message)
    }
  }
}
