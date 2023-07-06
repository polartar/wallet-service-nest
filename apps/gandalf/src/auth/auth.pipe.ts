import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import Joi = require('joi')

import { IAuthData } from './auth.types'
import { EAuth } from '@rana/core'

@Injectable()
export class LoginValidationPipe implements PipeTransform {
  private schema = Joi.object().keys({
    idToken: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
    ),
    type: Joi.string().valid(EAuth.Google, EAuth.Apple),
    accountId: Joi.string(),
  })

  transform(value: IAuthData) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException('Validation failed: ' + error.message)
    }
    return value
  }
}
