import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import {
  ICoinType,
  IFeeResponse,
  ITransactionInput,
  ITransactionPush,
} from './transaction.types'

@Controller('transaction')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post('generate')
  generateTransaction(@Body() data: ITransactionInput) {
    return this.service.generate(data)
  }

  @Post('push')
  pushTransaction(@Body() data: ITransactionPush) {
    return this.service.push(data)
  }

  @Get('fee/:coin')
  async getFee(@Param('coin') coin: ICoinType): Promise<IFeeResponse> {
    return await this.service.getFee(coin)
  }
}
