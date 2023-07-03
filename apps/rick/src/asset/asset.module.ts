import { Module, forwardRef } from '@nestjs/common'
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
import { PortfolioModule } from '../portfolio/portfolio.module'
import { NftModule } from '../nft/nft.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity, //
      AccountEntity,
      AssetEntity,
      TransactionEntity,
    ]),
    // @Inject(forwardRef(() => PortfolioModule)),
    HttpModule,
    // NftModule,
    // AccountModule,
    // PortfolioModule,
  ],
  controllers: [AssetController],
  providers: [AssetService, NftService, PortfolioService],
  exports: [AssetService],
})
export class AssetModule {}
