import { Body, Controller, Post } from '@nestjs/common'
import { TransactionsService } from './transactions.service'

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Post('')
  async handleTransaction(@Body() data: any) {
    this.transactionService.handleTransaction(data)
  }
}
