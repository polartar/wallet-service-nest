import { WalletModule } from './../wallet/wallet.module'
import { Module, forwardRef } from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { AccountModule } from '../account/account.module'
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
