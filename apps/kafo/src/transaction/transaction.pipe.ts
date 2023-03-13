import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
// import Joi = require('joi')
import {
  ICoinType,
  ITransactionInput,
  ITransactionPush,
} from './transaction.types'
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
      throw new BadRequestException(`Validation failed: ${error.message}`)
    }
    return value
  }
}

export class TransactionPushPipe implements PipeTransform {
  private schema = Joi.object().keys({
    transaction: Joi.object().custom((value, helper) => {
      if (!value.tx) {
        return helper.message({ custom: 'invalid transaction' })
      }
      if (!value.tosign) {
        return helper.message({ custom: 'tosign is missing' })
      } else if (!value.pubkeys) {
        return helper.message({ custom: 'pubkeys is missing' })
      } else if (!value.signatures) {
        return helper.message({ custom: 'signatures is missing' })
      }

      return true
    }),
    coinType: Joi.string().valid(ICoinType.BITCOIN, ICoinType.ETHEREUM),
  })

  transform(value: ITransactionPush) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException(`Validation failed: ${error.message}`)
    }
    return value
  }
}
