import { RickModule } from './../gateways/rick.module'
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { NewsModule } from '../news/news.module'
import { MarketModule } from '../market/market.module'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { PortfolioModule } from '../portfolio/portfolio.module'
import { OnboardingModule } from '../onboarding/onboarding.module'
import { AccountsModule } from '../accounts/accounts.module'
import { TransactionModule } from '../transaction/transaction.module'
import { AuthModule } from '../auth/auth.module'
import { VaultModule } from '../vault/vault.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [Environment] }),
    AuthModule,
    RickModule,
    NewsModule,
    MarketModule,
    PortfolioModule,
    OnboardingModule,
    AccountsModule,
    TransactionModule,
    VaultModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
