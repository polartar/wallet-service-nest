import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
// import Joi = require('joi')
import { ICoinType, ITransactionInput } from './transaction.types'
import { isAddress } from 'ethers/lib/utils'
import * as Joi from 'joi'
import { validate } from 'bitcoin-address-validation'

@Injectable()
export class TransactionInputPipe implements PipeTransform {
  private schema = Joi.object().keys({
    from: Joi.string().custom((value, helper) => {
      if (isAddress(value) || validate(value)) {
        return true
      } else {
        return helper.message({ custom: 'From is invalid address' })
      }
    }),
    to: Joi.string().custom((value, helper) => {
      if (isAddress(value) || validate(value)) {
        return true
      } else {
        return helper.message({ custom: 'To is invalid address' })
      }
    }),
    amount: Joi.number().integer().options({ convert: false }).required(),
    coinType: Joi.string().valid(ICoinType.BITCOIN, ICoinType.ETHEREUM),
  })

  transform(value: ITransactionInput) {
    const { error } = this.schema.validate(value)
    if (error) {
      console.log(error)
      throw new BadRequestException(
        `Validation failed: ${error.details[0].message}`,
      )
    }
    return value
  }
}
