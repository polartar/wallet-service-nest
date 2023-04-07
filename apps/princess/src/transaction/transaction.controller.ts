import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { ECoinType } from '@rana/core'
import { TransactionService } from './transaction.service'
import { GenerateTransactionDto } from './dto/GenerateTransactionDto'
import { ITransaction } from './transaction.types'
import { GenerateNFTTransactionDto } from './dto/GenerateNFTTransactionDto'
import { PublishNFTTransactionDto } from './dto/PublishNFTTransactionDto'

@Controller('transaction')
@ApiTags('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':coin/fee')
  @ApiOperation({
    summary: 'Get the current network fee of the selected chain',
  })
  @ApiParam({ name: 'coin', enum: ECoinType })
  async getFee(@Param('coin', new ParseEnumPipe(ECoinType)) coin: ECoinType) {
    return this.transactionService.getFee(coin)
  }

  @Post()
  @ApiOperation({
    summary: 'Generate transaction object',
  })
  async generateTransaction(@Body() data: GenerateTransactionDto) {
    return this.transactionService.generateTransaction(
      data.from,
      data.to,
      data.amount,
      data.coin_type,
    )
  }

  @Post('publish')
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
