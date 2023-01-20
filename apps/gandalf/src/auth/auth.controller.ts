import { AuthService } from './auth.service';
import { Body, Controller, Post } from '@nestjs/common'

export type IAuthData = {
  idToken: string,
  type: 'GOOGLE' | 'APPLE'
}
@Controller('auth')
export class AuthController {
    constructor(private readonly service: AuthService) {}

    @Post('login')
    login(@Body() data: IAuthData) {
        return this.service.authorize(data)
    }
}
