import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseEnumPipe,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { ECoinType } from '@rana/core'
import { TransactionService } from './transaction.service'
import { GenerateTransactionDto } from './dto/GenerateTransactionDto'

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
    const response = await this.transactionService.getFee(coin)

    if (response.success) {
      return response.data
    } else {
      return new InternalServerErrorException(
        'Something went wrong in Kafo API',
      )
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Generate transaction object',
  })
  async generateTransaction(@Body() data: GenerateTransactionDto) {
    const response = await this.transactionService.generateTransaction(
      data.from,
      data.to,
      data.amount,
      data.coin_type,
    )

    if (response.success) {
      return response.data
    } else {
      return new InternalServerErrorException(
        'Something went wrong in Kafo API',
      )
    }
  }
}
