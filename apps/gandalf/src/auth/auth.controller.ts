import { AuthService } from './auth.service'
import { BadRequestException, Body, Controller, Post } from '@nestjs/common'

export enum IAuthType {
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}
export type IAuthData = {
  idToken: string
  type: IAuthType
}
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post()
  async login(@Body() data: IAuthData) {
    if (!data.idToken) {
      throw new BadRequestException("Token can't be null")
    }
    try {
      const response = await this.service.authorize(data)
      return response
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }
}
