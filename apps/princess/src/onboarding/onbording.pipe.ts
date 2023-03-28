import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import Joi = require('joi')

import { EAuth } from '@rana/core'
import { IOnboardingSignIn } from './onboarding.types'

@Injectable()
export class SignInValidationPipe implements PipeTransform {
  private schema = Joi.object().keys({
    token: Joi.string().regex(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
    ),
    type: Joi.string().valid(EAuth.Google, EAuth.Apple),
  })

  transform(value: IOnboardingSignIn) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException('Validation failed: ' + error.message)
    }
    return value
  }
}