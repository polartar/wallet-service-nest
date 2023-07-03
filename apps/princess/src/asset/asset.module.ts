import { Module } from '@nestjs/common'
import { AssetController } from './asset.controller'
import { AssetService } from './asset.service'
import { CoinService } from '../coin/coin.service'

@Module({
  controllers: [AssetController],
  providers: [AssetService, CoinService],
})
export class AssetModule {}
