import { AuthService } from './auth.service'
import {
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  @Post()
  @UsePipes(new LoginValidationPipe())
  async auth(@Body() data: IAuthData) {
    return this.authService.auth(data)
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
