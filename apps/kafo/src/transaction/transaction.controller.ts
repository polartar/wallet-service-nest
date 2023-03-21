import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  UsePipes,
} from '@nestjs/common'
import { TransactionService } from './transaction.service'
import {
  IFeeResponse,
  ITransactionInput,
  ITransactionPush,
  ITransactionResponse,
} from './transaction.types'
import { TransactionInputPipe, TransactionPushPipe } from './transaction.pipe'
import { ICoinType } from '@rana/core'

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
  async getFee(
    @Param('coin', new ParseEnumPipe(ICoinType)) coin: ICoinType,
  ): Promise<IFeeResponse> {
    return await this.service.getFee(coin)
  }
}
