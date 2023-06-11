import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { ECoinType } from '@rana/core'
import { TransactionService } from './transaction.service'
import {
  GenerateTransactionDto,
  GenerateTransactionSwaggerResponse,
  PublishTransactionSwaggerResponse,
} from './dto/generate-transaction.dto'
import { ITransaction } from './transaction.types'
import { GenerateNFTTransactionDto } from './dto/generate-nft-transaction.dto'
import { PublishNFTTransactionDto } from './dto/publish-nft-transaction.dto'
import { TransactionFeeSwaggerResponse } from './dto/transaction-fee-response.dto'

@Controller('transaction')
@ApiTags('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':coin/fee')
  @ApiOkResponse({ type: TransactionFeeSwaggerResponse })
  @ApiOperation({
    summary: 'Get the current network fee of the selected chain',
  })
  @ApiParam({ name: 'coin', enum: ECoinType })
  async getFee(@Param('coin', new ParseEnumPipe(ECoinType)) coin: ECoinType) {
    return this.transactionService.getFee(coin)
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
      data.coin_type,
      data.public_key,
    )
  }

  @Post('publish')
  @ApiOkResponse({ type: PublishTransactionSwaggerResponse })
  @ApiOperation({
    summary: 'Publish the signed transaction',
  })
  async publishTransaction(@Body() data: ITransaction) {
    return this.transactionService.publishTransaction(
      data.transaction,
      data.coin_type,
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
      data.tokenId,
      data.type,
      data.amount,
    )
  }

  @Post('nft/publish')
  @ApiOperation({
    summary: 'Publish the transaction',
  })
  async publishNFTTransaction(@Body() data: PublishNFTTransactionDto) {
    return this.transactionService.publishNFTTransaction(data.signed_hash)
  }
}
