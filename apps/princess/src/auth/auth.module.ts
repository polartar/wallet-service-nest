import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { HttpModule } from '@nestjs/axios'
import { AccountsService } from '../accounts/accounts.service'
import { MarketService } from '../coin/coin.service'
import { TransactionService } from '../transaction/transaction.service'
import { BootstrapService } from '../bootstrap/bootstrap.service'

@Module({
  imports: [
    HttpModule.register({
      timeout: parseInt(process.env.httptimeout) || 0,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccountsService,
    MarketService,
    TransactionService,
    BootstrapService,
  ],
})
export class AuthModule {}
