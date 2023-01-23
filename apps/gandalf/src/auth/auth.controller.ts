import { AuthService } from './auth.service'
import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
// import {Joi} from 'joi'
import Joi = require('joi')

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
    const schema = Joi.object().keys({
      idToken: Joi.string().regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
      ),
      type: Joi.string().valid(IAuthType.GOOGLE, IAuthType.APPLE),
    })

    try {
      const res = schema.validate(data)
      if (res.error) {
        console.log(res.error.message)
        throw new Error(res.error.message)
      }

      const response = await this.service.authorize(data)
      return response
    } catch (err) {
      console.log({ err })
      throw new BadRequestException(err.message)
    }
  }
}
