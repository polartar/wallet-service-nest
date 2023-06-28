import { Module } from '@nestjs/common'
import { AssetController } from './asset.controller'
import { AssetService } from './asset.service'
import { MarketService } from '../market/market.service'

@Module({
  controllers: [AssetController],
  providers: [AssetService, MarketService],
})
export class AssetModule {}
