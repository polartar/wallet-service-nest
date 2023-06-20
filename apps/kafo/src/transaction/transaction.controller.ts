import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseEnumPipe,
  Post,
  UsePipes,
} from '@nestjs/common'
import { TransactionService } from './transaction.service'
import {
  IFeeResponse,
  INFTTransactionInput,
  ITransactionInput,
  ITransactionPush,
  ITransactionResponse,
} from './transaction.types'
import { ECoinType, ENetworks } from '@rana/core'
import { NFTTransactionRawPipe, TransactionInputPipe } from './transaction.pipe'

@Controller('transaction')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post('generate')
  @UsePipes(new TransactionInputPipe())
  generateTransaction(
    @Body() data: ITransactionInput,
  ): Promise<ITransactionResponse> {
    if (data.coinType === ECoinType.ETHEREUM) {
      return this.service.generateEthereumTransaction(data, false)
    } else {
      return this.service.generateBTCTransaction(data)
    }
  }

  @Post('publish')
  publishTransaction(@Body() data: ITransactionPush) {
    return this.service.publish(
      data.serializedTransaction,
      data.signature,
      data.coinType,
    )
  }

  @Get('fee/:coin')
  async getFee(
    @Param('coin', new ParseEnumPipe(ECoinType)) coin: ECoinType,
    @Headers() headers,
  ): Promise<IFeeResponse> {
    console.log(headers)
    return await this.service.getFee(
      coin,
      headers['X-NETWORK'] === ENetworks.MAINNET,
    )
  }

  @Post('nft/generate')
  @UsePipes(new NFTTransactionRawPipe())
  generateNFTRawTransaction(
    @Body() data: INFTTransactionInput,
  ): Promise<ITransactionResponse> {
    return this.service.generateEthereumTransaction(data, true)
  }

  @Post('nft/publish')
  publishNFTTransaction(@Body() data: ITransactionPush) {
    return this.service.publish(
      data.serializedTransaction,
      data.signature,
      ECoinType.ETHEREUM,
    )
  }
}
