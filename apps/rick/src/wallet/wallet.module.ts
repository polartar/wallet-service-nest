import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from './wallet.entity'
import { WalletService } from './wallet.service'
import { AccountEntity } from '../account/account.entity'
import { WalletController } from './wallet.controller'
import { PortfolioModule } from '../portfolio/portfolio.module'
import { AccountModule } from '../account/account.module'
import { HttpModule } from '@nestjs/axios'
import { TransactionEntity } from './transaction.entity'
import { AssetEntity } from './asset.entity'
import { AssetService } from '../asset/asset.service'
import { PortfolioService } from '../portfolio/portfolio.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity, //
      AccountEntity,
      AssetEntity,
      TransactionEntity,
    ]),
    forwardRef(() => PortfolioModule),
    AccountModule,
    HttpModule,
  ],
  controllers: [WalletController],
  providers: [WalletService, AssetService, PortfolioService],
  exports: [WalletService],
})
export class WalletModule {}
