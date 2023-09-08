import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
// import Joi = require('joi')
import { ENFTTypes, ITransactionInput } from './transaction.types'
import { isAddress } from 'ethers/lib/utils'
import * as Joi from 'joi'
import { validate } from 'bitcoin-address-validation'
import { ENetworks } from '@rana/core'

@Injectable()
export class TransactionInputPipe implements PipeTransform {
  private schema = Joi.object().keys({
    from: Joi.string().required(),
    to: Joi.string().required(),
    amount: Joi.string().required(),
    network: Joi.string().valid(
      ENetworks.BITCOIN,
      ENetworks.ETHEREUM,
      ENetworks.BITCOIN_TEST,
      ENetworks.ETHEREUM_TEST,
    ),
    transferMessage: Joi.string(),
    publicKey: Joi.string().required(),
    tokenTransfer: Joi.object(),
  })

  transform(value: ITransactionInput) {
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
    publicKey: Joi.string().required(),
    type: Joi.string().valid(ENFTTypes.ERC1155, ENFTTypes.ERC721).required(),
    amount: Joi.number(),
    network: Joi.string().valid(ENetworks.ETHEREUM, ENetworks.ETHEREUM_TEST),
  })

  transform(value: ITransactionInput) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException(`Validation failed: ${error.message}`)
    }
    return value
  }
}
