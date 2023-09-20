import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { ITransactionInput } from './transaction.types'
import * as Joi from 'joi'
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
