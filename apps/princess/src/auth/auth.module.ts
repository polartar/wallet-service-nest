import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { HttpModule } from '@nestjs/axios'
import { AccountsService } from '../accounts/accounts.service'
import { CoinService } from '../coin/coin.service'
import { TransactionService } from '../transaction/transaction.service'
import { BootstrapService } from '../bootstrap/bootstrap.service'

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccountsService,
    CoinService,
    TransactionService,
    BootstrapService,
  ],
})
export class AuthModule {}
