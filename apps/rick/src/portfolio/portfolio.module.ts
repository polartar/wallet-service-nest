import { Module } from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { HttpModule } from '@nestjs/axios'
import { AssetModule } from '../asset/asset.module'

@Module({
  imports: [HttpModule, AssetModule],
  providers: [
    PortfolioService, //
    // AssetService,
  ],
  exports: [PortfolioService],
})
export class PortfolioModule {}
