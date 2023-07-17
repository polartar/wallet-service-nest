import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { ENetworks } from '@rana/core'
import { TransactionService } from './transaction.service'
import {
  GenerateTransactionDto,
  GenerateTransactionSwaggerResponse,
  PublishTransactionSwaggerResponse,
} from './dto/generate-transaction.dto'
import { GenerateNFTTransactionDto } from './dto/generate-nft-transaction.dto'
import { TransactionFeeSwaggerResponse } from './dto/transaction-fee-response.dto'
import { PublishTransactionDto } from './dto/publish-transaction.dto'
import { Public } from '../gateway/decorators/public.decorator'

@Controller('transaction')
@ApiTags('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':network/fee')
  @ApiOkResponse({ type: TransactionFeeSwaggerResponse })
  @ApiOperation({
    summary: 'Get the current network fee of the selected chain',
  })
  @ApiParam({ name: 'network', enum: ENetworks })
  async getFee(
    @Param('network', new ParseEnumPipe(ENetworks)) network: ENetworks,
  ) {
    return this.transactionService.getFee(network)
  }

  @Post()
  @ApiOkResponse({ type: GenerateTransactionSwaggerResponse })
  @ApiOperation({
    summary: 'Generate transaction object',
  })
  async generateTransaction(@Body() data: GenerateTransactionDto) {
    return this.transactionService.generateTransaction(
      data.from,
      data.to,
      data.amount,
      data.network,
      data.transferMessage,
    )
  }

  @Post('publish')
  @ApiOkResponse({ type: PublishTransactionSwaggerResponse })
  @ApiOperation({
    summary: 'Publish the signed transaction',
  })
  async publishTransaction(@Body() data: PublishTransactionDto) {
    return this.transactionService.publishTransaction(
      data.serializedTransaction,
      data.signedPayloads,
      data.network,
    )
  }

  @Post('nft')
  @ApiOkResponse({ type: GenerateTransactionSwaggerResponse })
  @ApiOperation({
    summary: 'Generate NFT transfer transaction hash',
  })
  async generateNFTTransaction(@Body() data: GenerateNFTTransactionDto) {
    return this.transactionService.generateNFTTransaction(
      data.from,
      data.to,
      data.contract_address,
      data.public_key,
      data.tokenId,
      data.type,
      data.network,
      data.amount,
    )
  }

  @Post('nft/publish')
  @ApiOkResponse({ type: PublishTransactionSwaggerResponse })
  @ApiOperation({
    summary: 'Publish the transaction',
  })
  async publishNFTTransaction(@Body() data: PublishTransactionDto) {
    return this.transactionService.publishNFTTransaction(
      data.serializedTransaction,
      data.signature,
      data.network,
    )
  }
}
