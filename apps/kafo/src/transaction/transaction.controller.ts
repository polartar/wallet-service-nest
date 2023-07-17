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
  ITransactionInput,
  ITransactionPush,
  IVaultTransactionResponse,
} from './transaction.types'
import { ENetworks } from '@rana/core'
import { NFTTransactionRawPipe, TransactionInputPipe } from './transaction.pipe'

@Controller('transaction')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post('generate')
  @UsePipes(new TransactionInputPipe())
  generateTransaction(
    @Body() data: ITransactionInput,
  ): Promise<IVaultTransactionResponse> {
    return this.service.generateTransaction(
      data.from,
      data.to,
      data.amount,
      data.transferMessage,
      data.network,
    )
  }

  @Post('publish')
  publishTransaction(@Body() data: ITransactionPush) {
    return this.service.publish(
      data.serializedTransaction,
      data.signedPayloads,
      data.network,
    )
  }

  @Get('fee/:network')
  async getFee(
    @Param('network', new ParseEnumPipe(ENetworks)) network: ENetworks,
  ): Promise<IFeeResponse> {
    return await this.service.getFee(network)
  }

  @Post('nft/generate')
  @UsePipes(new NFTTransactionRawPipe())
  generateNFTRawTransaction(
    @Body() data: INFTTransactionInput,
  ): Promise<IVaultTransactionResponse> {
    return this.service.generateNFTTransaction(data)
  }

  @Post('nft/publish')
  publishNFTTransaction(@Body() data: ITransactionPush) {
    return this.service.publish(
      data.serializedTransaction,
      data.signedPayloads,
      data.network,
    )
  }
}
