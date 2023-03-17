import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { isAddress } from 'ethers/lib/utils'
import { INTAssetInput } from './nft.types'
import Joi = require('joi')

@Injectable()
export class NftPipe implements PipeTransform {
  private schema = Joi.object().keys({
    address: Joi.string().custom((value, helper) => {
      if (isAddress(value)) {
        return true
      } else {
        return helper.message({ custom: 'Address is invalid' })
      }
    }),
    page: Joi.number()
      .greater(0)
      .custom((value, helper) => {
        if (!value || !isNaN(value)) {
          return true
        } else {
          return helper.message({ custom: 'page is invalid' })
        }
      }),
  })

  transform(value: INTAssetInput) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException(`Validation failed: ${error.message}`)
    }
    return value
  }
}
