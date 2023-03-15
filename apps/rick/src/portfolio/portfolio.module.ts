import { WalletEntity } from './../wallet/wallet.entity'
import { WalletModule } from './../wallet/wallet.module'
import { Module, forwardRef } from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { AccountModule } from '../account/account.module'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Environment } from '../environments/environment.dev'
import { AccountEntity } from '../account/account.entity'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    AccountModule, //
    HttpModule,
    forwardRef(() => WalletModule),
  ],
  providers: [
    PortfolioService, //
  ],
  exports: [PortfolioService],
})
export class PortfolioModule {}
