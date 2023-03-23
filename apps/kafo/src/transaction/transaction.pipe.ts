import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
// import Joi = require('joi')
import {
  ENFTTypes,
  ITransactionInput,
  ITransactionPush,
} from './transaction.types'
import { isAddress } from 'ethers/lib/utils'
import * as Joi from 'joi'
import { validate } from 'bitcoin-address-validation'
import { ECoinType } from '@rana/core'

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
    coinType: Joi.string().valid(ECoinType.BITCOIN, ECoinType.ETHEREUM),
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
    coinType: Joi.string().valid(ECoinType.BITCOIN, ECoinType.ETHEREUM),
  })

  transform(value: ITransactionPush) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException(`Validation failed: ${error.message}`)
    }
    return value
  }
}

export class NFTTransactionRawPipe implements PipeTransform {
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
    contractAddress: Joi.string().custom((value, helper) => {
      if (isAddress(value) || validate(value)) {
        return true
      } else {
        return helper.message({ custom: 'contractAddress is invalid address' })
      }
    }),
    tokenId: Joi.number().integer().options({ convert: false }).required(),
    type: Joi.string().valid(ENFTTypes.ERC1155, ENFTTypes.ERC721).required(),
    amount: Joi.number().integer().options({ convert: false }),
  })

  transform(value: ITransactionInput) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException(`Validation failed: ${error.message}`)
    }
    return value
  }
}

export class NFTTransactionSendPipe implements PipeTransform {
  private schema = Joi.object().keys({
    signedHash: Joi.string().required(),
  })

  transform(value: ITransactionPush) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException(`Validation failed: ${error.message}`)
    }
    return value
  }
}
