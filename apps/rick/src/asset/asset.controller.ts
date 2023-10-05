import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { AssetService } from './asset.service'
import { CreateAssetDto } from './dto/create-asset.dto'
import { DiscoverAssetDto } from './dto/discover-asset.dto'

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('')
  async createAsset(@Body() data: CreateAssetDto) {
    return this.assetService.createAsset(
      data.address,
      data.index,
      data.network,
      data.publicKey,
    )
  }

  @Post('/discover')
  async discoverAsset(@Body() data: DiscoverAssetDto) {
    return this.assetService.addAssetFromXPub(
      data.xPub,
      data.index,
      data.network,
      data.address,
      data.publicKey,
    )
  }

  // Need to confirm account verification
  @Get(':assetId')
  async getAsset(@Param('assetId') assetId: string) {
    return this.assetService.getAsset(assetId)
  }

  @Get(':assetId/transactions')
  async getAssetTransactions(
    @Param('assetId') assetId: string,
    @Body('accountId') accountId: string,
  ) {
    return this.assetService.getAssetTransactions(assetId, accountId)
  }

  @Get(':assetId/portfolio')
  async getAssetPortfolio(
    @Param('assetId') assetId: string,
    @Query('accountId') accountId: string,
  ) {
    return this.assetService.getAssetPortfolio(assetId, accountId)
  }

  @Get(':assetId/nft')
  async getNftTransactions(
    @Param('assetId') assetId: string,
    @Query('pageNumber') pageNumber?: number,
  ) {
    return this.assetService.getNftTransactions(assetId, pageNumber)
  }
}
