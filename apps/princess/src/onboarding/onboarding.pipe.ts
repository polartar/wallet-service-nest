import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import Joi = require('joi')

import { EAuth } from '@rana/core'
import { SignInDto } from './dto/SigninDto'

@Injectable()
export class SignInValidationPipe implements PipeTransform {
  private schema = Joi.object().keys({
    id_token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
    ),
    type: Joi.string().valid(EAuth.Google, EAuth.Apple),
    device_id: Joi.string().required(),
    otp: Joi.string().required(),
    server_proposed_shard: Joi.string().required(),
    own_proposed_shard: Joi.string().required(),
    passcode_key: Joi.string().required(),
    recovery_key: Joi.string().required(),
  })

  transform(value: SignInDto) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException('Validation failed: ' + error.message)
    }
    return value
  }
}
