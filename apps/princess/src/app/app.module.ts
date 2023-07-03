import { RickModule } from './../gateways/rick.module'
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { NewsModule } from '../news/news.module'
import { MarketModule } from '../coin/coin.module'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { PortfolioModule } from '../portfolio/portfolio.module'
import { AccountsModule } from '../accounts/accounts.module'
import { TransactionModule } from '../transaction/transaction.module'
import { GateWayModule } from '../gateway/gateway.module'
import { BootstrapModule } from '../bootstrap/bootstrap.module'
import { AuthModule } from '../auth/auth.module'
import { AssetModule } from '../asset/asset.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [Environment] }),
    GateWayModule,
    RickModule,
    NewsModule,
    MarketModule,
    PortfolioModule,
    AuthModule,
    AccountsModule,
    TransactionModule,
    BootstrapModule,
    AssetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
