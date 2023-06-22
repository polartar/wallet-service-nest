import { Module } from '@nestjs/common'
import { WalletsController } from './wallet.controller'
import { HttpModule } from '@nestjs/axios'
import { WalletsService } from './wallet.service'
import { MarketService } from '../market/market.service'
import { TransactionService } from '../transaction/transaction.service'
import { AuthService } from '../auth/auth.service'

@Module({
  imports: [
    HttpModule, //
  ],
  controllers: [WalletsController],
  providers: [WalletsService, MarketService, TransactionService, AuthService],
})
export class WalletsModule {}
