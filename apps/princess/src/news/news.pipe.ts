import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import Joi = require('joi')
import { ESort, INewsQuery } from './news.types'
import { ECoinTypes } from '@rana/core'

@Injectable()
export class NewsValidationPipe implements PipeTransform {
  private schema = Joi.object().keys({
    sort: Joi.string().valid(ESort.ASC, ESort.DESC),
    'page-number': Joi.number().integer().greater(0),
    'count-per-page': Joi.number().integer().greater(0),
    highlights: Joi.number().integer().greater(0),
    'start-time': Joi.date(),
    'end-time': Joi.date(),
    coin: Joi.string().valid(ECoinTypes.BITCOIN, ECoinTypes.ETHEREUM),
  })

  transform(value: INewsQuery) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException('Validation failed: ' + error.message)
    }
    return value
  }
}
