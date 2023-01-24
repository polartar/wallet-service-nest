import { AuthService } from './auth.service'
import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
// import {Joi} from 'joi'
import Joi = require('joi')
import { IAuthData, EAuth } from './auth.types'

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post()
  async login(@Body() data: IAuthData) {
    const schema = Joi.object().keys({
      idToken: Joi.string().regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
      ),
      type: Joi.string().valid(EAuth.Google, EAuth.Apple),
    })

    try {
      const res = schema.validate(data)
      if (res.error) {
        throw new Error(res.error.message)
      }

      return await this.service.authorize(data)
    } catch (err) {
      throw new BadRequestException(err.message)
    }
  }
}
