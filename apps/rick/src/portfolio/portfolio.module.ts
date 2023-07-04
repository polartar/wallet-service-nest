import { Module, forwardRef } from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { AccountModule } from '../account/account.module'
import { HttpModule } from '@nestjs/axios'
import { AssetModule } from '../asset/asset.module'
import { AssetService } from '../asset/asset.service'
import { NftService } from '../nft/nft.service'

@Module({
  imports: [HttpModule, AssetModule],
  providers: [
    PortfolioService, //
    // AssetService,
  ],
  exports: [PortfolioService],
})
export class PortfolioModule {}
