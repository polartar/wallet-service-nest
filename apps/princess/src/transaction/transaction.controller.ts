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
import { TransactionFeeSwaggerResponse } from './dto/transaction-fee-response.dto'
import { PublishTransactionDto } from './dto/publish-transaction.dto'
import { GenerateVaultTransactionDto } from './dto/generate-vault-transaction.dto'
import { PublishVaultTransactionDto } from './dto/publish-vault-transaction.dto'
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
      data.publicKey,
      data.network,
      data.transferMessage,
      data.tokenTransfer,
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

  @Post('vault')
  @ApiOperation({
    summary: 'Generate the vault transaction object',
  })
  async generateVaultTransaction(@Body() data: GenerateVaultTransactionDto) {
    return this.transactionService.generateVaultTransaction(
      data.serializedTransaction,
      data.derivationIndex,
      data.network,
    )
  }

  @Post('vault/send')
  @Public()
  @ApiOkResponse({ type: PublishTransactionSwaggerResponse })
  @ApiOperation({
    summary: 'Publish the vault transaction',
  })
  async publishVaultTransaction(@Body() data: PublishVaultTransactionDto) {
    return this.transactionService.publishVaultTransaction(
      data.serializedTransaction,
      data.parts,
      data.network,
    )
  }
}
