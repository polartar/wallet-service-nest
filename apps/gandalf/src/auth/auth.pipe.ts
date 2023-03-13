import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import Joi = require('joi')

import { EAuth, IAuthData } from './auth.types'

@Injectable()
export class LoginValidationPipe implements PipeTransform {
  private schema = Joi.object().keys({
    idToken: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
    ),
    type: Joi.string().valid(EAuth.Google, EAuth.Apple),
  })

  transform(value: IAuthData) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException('Validation failed: ' + error.message)
    }
    return value
  }
}
