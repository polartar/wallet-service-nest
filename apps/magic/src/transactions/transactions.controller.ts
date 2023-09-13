import { Body, Controller, Post } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { ITransactionWebhookData, IWebhookData } from './transactions.types'

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}
  @Post('/crypto-api')
  async handleCryptoApiTransaction(@Body() data: ITransactionWebhookData) {
    this.transactionService.handleCryptoApiTransaction(data)
  }
  @Post('')
  async handleTransaction(@Body() data: IWebhookData) {
    this.transactionService.handleTransaction(data)
  }
}
