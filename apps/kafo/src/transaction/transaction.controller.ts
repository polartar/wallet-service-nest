import { Body, Controller, Post } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { ITransactionInput } from './transaction.types'

@Controller('transaction')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post('generate')
  generate(@Body() data: ITransactionInput) {
    return this.service.generate(data)
  }
}
