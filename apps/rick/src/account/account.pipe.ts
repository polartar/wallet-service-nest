import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import Joi = require('joi')
import { CreateAccountDto } from './dto/create-account.dto'

@Injectable()
export class AccountValidationPipe implements PipeTransform {
  private schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }),
    name: Joi.string().required(),
    accountId: Joi.number().required(),
  })

  transform(value: CreateAccountDto) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException('Email Validation failed')
    }
    return value
  }
}
