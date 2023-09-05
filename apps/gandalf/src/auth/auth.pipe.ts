import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import Joi = require('joi')

import { IAuthData } from './auth.types'
import { EAuth, EFlavor, EPlatform } from '@rana/core'

@Injectable()
export class LoginValidationPipe implements PipeTransform {
  private schema = Joi.object().keys({
    idToken: Joi.string(),
    type: Joi.string().valid(EAuth.Google, EAuth.Apple),
    platform: Joi.string().valid(EPlatform.Android, EPlatform.IOS).optional(),
    flavor: Joi.string().valid(EFlavor.FCAT, EFlavor.Greens).optional(),
    accountId: Joi.string(),
    deviceId: Joi.string(),
    otp: Joi.string(),
    accountShard: Joi.string().optional(),
    iCloudShard: Joi.string().optional(),
    vaultShard: Joi.string().optional(),
    passcodeKey: Joi.string().optional(),
    recoveryKey: Joi.string().optional(),
    serverShard: Joi.string().optional(),
  })

  transform(value: IAuthData) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException('Validation failed: ' + error.message)
    }
    return value
  }
}
