import { Module } from '@nestjs/common'
import { WalletsController } from './wallet.controller'
import { HttpModule } from '@nestjs/axios'
import { WalletsService } from './wallet.service'
import { AssetModule } from '../asset/asset.module'
import { CoinService } from '../coin/coin.service'

@Module({
  imports: [
    HttpModule, //
    AssetModule,
  ],
  controllers: [WalletsController],
  providers: [WalletsService, CoinService],
})
export class WalletModule {}
