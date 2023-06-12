import { Module } from '@nestjs/common'
import { TransactionController } from './transaction.controller'
import { TransactionService } from './transaction.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
