import { Module } from '@nestjs/common'
import { OnboardingController } from './onboarding.controller'
import { OnboardingService } from './onboarding.service'
import { HttpModule } from '@nestjs/axios'
import { AccountsService } from '../accounts/accounts.service'
import { MarketService } from '../market/market.service'
import { TransactionService } from '../transaction/transaction.service'

@Module({
  imports: [
    HttpModule.register({
      timeout: parseInt(process.env.httptimeout) || 0,
    }),
  ],
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    AccountsService,
    MarketService,
    TransactionService,
  ],
})
export class OnboardingModule {}
