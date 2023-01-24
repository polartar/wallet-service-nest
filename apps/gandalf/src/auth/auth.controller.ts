import { AuthService } from './auth.service'
import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import { IAuthData } from './auth.types'
import { LoginValidationPipe } from './auth.pipe'

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post()
  @UsePipes(new LoginValidationPipe())
  async login(@Body() data: IAuthData) {
    return this.service.authorize(data)
  }
}
