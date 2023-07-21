import { Module } from '@nestjs/common'
import { AssetController } from './asset.controller'
import { AssetService } from './asset.service'
import { HttpModule } from '@nestjs/axios'
import { TransactionEntity } from '../wallet/transaction.entity'
import { AssetEntity } from '../wallet/asset.entity'
import { AccountEntity } from '../account/account.entity'
import { WalletEntity } from '../wallet/wallet.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NftService } from '../nft/nft.service'
import { PortfolioService } from '../portfolio/portfolio.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity, //
      AccountEntity,
      AssetEntity,
      TransactionEntity,
    ]),
    HttpModule,
  ],
  controllers: [AssetController],
  providers: [AssetService, NftService, PortfolioService],
  exports: [AssetService],
})
export class AssetModule {}
