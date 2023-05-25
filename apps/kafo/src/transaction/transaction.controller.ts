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
  INFTTransactionInput,
  INFTTransactionResponse,
  ITransactionInput,
  ITransactionPush,
  ITransactionResponse,
} from './transaction.types'
import { ECoinType } from '@rana/core'
import {
  NFTTransactionRawPipe,
  NFTTransactionSendPipe,
  TransactionInputPipe,
  TransactionPushPipe,
} from './transaction.pipe'

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

  @Post('publish')
  @UsePipes(new TransactionPushPipe())
  publishTransaction(
    @Body() data: ITransactionPush,
  ): Promise<ITransactionResponse> {
    return this.service.publish(data)
  }

  @Get('fee/:coin')
  async getFee(
    @Param('coin', new ParseEnumPipe(ECoinType)) coin: ECoinType,
  ): Promise<IFeeResponse> {
    return await this.service.getFee(coin)
  }

  @Post('nft/generate')
  @UsePipes(new NFTTransactionRawPipe())
  generateNFTRawTransaction(
    @Body() data: INFTTransactionInput,
  ): Promise<INFTTransactionResponse> {
    return this.service.generateNFTRawTransaction(data)
  }

  @Post('nft/publish')
  @UsePipes(new NFTTransactionSendPipe())
  publishNFTTransaction(
    @Body() signedHash: string,
  ): Promise<INFTTransactionResponse> {
    return this.service.publishNFTTransaction(signedHash)
  }
}
