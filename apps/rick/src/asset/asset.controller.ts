import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { AssetService } from './asset.service'
import { CreateAssetDto } from './dto/create-asset.dto'
import { DiscoverAssetDto } from './dto/discover-asset.dto'

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('')
  async createAsset(@Body() data: CreateAssetDto) {
    return this.assetService.createAsset(data.address, data.index, data.network)
  }

  @Post('/discover')
  async discoverAsset(@Body() data: DiscoverAssetDto) {
    return this.assetService.addAssetFromXPub(
      data.xPub,
      data.index,
      data.network,
    )
  }

  // Need to confirm account verification
  @Get(':assetId')
  async getAsset(
    @Param('assetId') assetId: number,
    // @Query('accountId') accountId: number,
  ) {
    return this.assetService.getAsset(assetId)
  }

  @Get(':assetId/transactions')
  async getAssetTransactions(
    @Param('assetId') assetId: number,
    @Body('accountId') accountId: number,
    @Query('start') start: number,
    @Query('count') count: number,
  ) {
    return this.assetService.getAssetTransactions(
      assetId,
      accountId,
      start,
      count,
    )
  }
}
