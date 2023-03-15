import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from './wallet.entity'
import { WalletService } from './wallet.service'
import { AccountEntity } from '../account/account.entity'
import { WalletController } from './wallet.controller'
import { PortfolioModule } from '../portfolio/portfolio.module'
import { AccountModule } from '../account/account.module'
import { Environment } from '../environments/environment.dev'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { HistoryEntity } from './history.entity'
import { AddressEntity } from './address.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity, //
      AccountEntity,
      AddressEntity,
      HistoryEntity,
    ]),
    forwardRef(() => PortfolioModule),
    AccountModule,
    HttpModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
