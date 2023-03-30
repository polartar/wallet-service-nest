import { AuthService } from './auth.service'
import {
  BadRequestException,
  Body,
  Controller,
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
  async login(@Body() data: IAuthData) {
    try {
      const { name, email } = await this.authService.authorize(data)
      const account = await this.accountService.lookup({ email })

      if (account) {
        return {
          is_new: false,
          account,
        }
      } else {
        const createdAccount = await this.accountService.create({ name, email })
        return {
          is_new: true,
          account: createdAccount,
        }
      }
    } catch (e) {
      throw new BadRequestException(e?.message)
    }
  }
}
