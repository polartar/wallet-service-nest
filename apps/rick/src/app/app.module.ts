import { PortfolioModule } from './../portfolio/portfolio.module'
import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { WalletModule } from '../wallet/wallet.module'
import { NftModule } from '../nft/nft.module'

@Module({
  imports: [
    PortfolioModule, //
    WalletModule,
    NftModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
