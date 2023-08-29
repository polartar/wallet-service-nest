import { Module } from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { HttpModule } from '@nestjs/axios'
import { AssetModule } from '../asset/asset.module'
import { CoinService } from '../coin/coin.service'

@Module({
  imports: [HttpModule, AssetModule],
  providers: [PortfolioService, CoinService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
