import { Module } from '@nestjs/common'
import { AccountsController } from './accounts.controller'
import { HttpModule } from '@nestjs/axios'
import { AccountsService } from './accounts.service'
import { MarketService } from '../market/market.service'
import { TransactionService } from '../transaction/transaction.service'
import { AuthService } from '../auth/auth.service'

@Module({
  imports: [
    HttpModule, //
  ],
  controllers: [AccountsController],
  providers: [AccountsService, MarketService, TransactionService, AuthService],
})
export class AccountsModule {}
