import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import Joi = require('joi')
import { ESort, INewsQuery } from './news.types'

@Injectable()
export class NewsValidationPipe implements PipeTransform {
  private schema = Joi.object().keys({
    sort: Joi.string().valid(ESort.ASC, ESort.DESC),
    pageNumber: Joi.number().integer().greater(0),
    countPerPage: Joi.number().integer().greater(0),
    startTime: Joi.date(),
    endTime: Joi.date(),
  })

  transform(value: INewsQuery) {
    const { error } = this.schema.validate(value)
    if (error) {
      throw new BadRequestException('Validation failed: ' + error.message)
    }
    return value
  }
}
