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
  IVaultPublishTransactionInput,
  IVaultTransactionInput,
  IVaultTransactionResponse,
} from './transaction.types'
import { ENetworks } from '@rana/core'
import { TransactionInputPipe } from './transaction.pipe'

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
      data.publicKey,
      data.network,
      data.tokenTransfer,
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

  @Post('vault-transaction')
  async generateVaultTransaction(@Body() data: IVaultTransactionInput) {
    return this.service.generateVaultTransaction(
      data.serializedTransaction,
      data.derivedIndex,
      data.network,
    )
  }

  @Post('vault-transaction/send')
  async publishVaultTransaction(@Body() data: IVaultPublishTransactionInput) {
    return this.service.publishVaultTransaction(
      data.serializedTransaction,
      data.parts,
      data.network,
    )
  }
}
