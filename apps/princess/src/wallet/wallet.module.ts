import { Module } from '@nestjs/common'
import { WalletsController } from './wallet.controller'
import { HttpModule } from '@nestjs/axios'
import { WalletsService } from './wallet.service'
import { AssetService } from '../asset/asset.service'

@Module({
  imports: [
    HttpModule, //
  ],
  controllers: [WalletsController],
  providers: [WalletsService, AssetService],
})
export class WalletsModule {}
