import { Body, Controller, Post } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { IWebhookData } from './transactions.types'

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Post('')
  async handleTransaction(@Body() data: IWebhookData) {
    this.transactionService.handleTransaction(data)
  }

  @Post('subscribe-btc')
  async subscribeBtcTransaction() {
    await this.transactionService.subscribeBtcTransaction()
  }
}
