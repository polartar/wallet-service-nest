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
  ICoinType,
  IFeeResponse,
  INFTTransactionInput,
  INFTTransactionResponse,
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
  async getFee(
    @Param('coin', new ParseEnumPipe(ICoinType)) coin: ICoinType,
  ): Promise<IFeeResponse> {
    return await this.service.getFee(coin)
  }

  @Post('nft/raw-transaction')
  // @UsePipes(new TransactionInputPipe())
  generateNFTRawTransaction(
    @Body() data: INFTTransactionInput,
  ): Promise<INFTTransactionResponse> {
    return this.service.generateNFTRawTransaction(data)
  }

  @Post('nft/send-transaction')
  // @UsePipes(new TransactionInputPipe())
  sendNFTTransaction(
    @Body() signedHash: string,
  ): Promise<INFTTransactionResponse> {
    return this.service.sendNFTTransaction(signedHash)
  }
}
