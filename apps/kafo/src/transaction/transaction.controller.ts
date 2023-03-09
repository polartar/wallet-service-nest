import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import {
  ICoinType,
  IFeeResponse,
  ITransactionInput,
  ITransactionPush,
  ITransactionResponse,
} from './transaction.types'
import { TransactionInputPipe, TransactionPushPipe } from './transaction.pipe'

@Controller('transaction')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post('generate')
  @UsePipes(new TransactionInputPipe())
  generateTransaction(
    @Body() data: ITransactionInput,
  ): Promise<ITransactionResponse> {
    return this.service.generate(data)
  }

  @Post('push')
  @UsePipes(new TransactionPushPipe())
  pushTransaction(
    @Body() data: ITransactionPush,
  ): Promise<ITransactionResponse> {
    return this.service.push(data)
  }

  @Get('fee/:coin')
  async getFee(@Param('coin') coin: ICoinType): Promise<IFeeResponse> {
    return await this.service.getFee(coin)
  }
}
