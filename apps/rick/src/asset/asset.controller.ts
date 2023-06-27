import { Body, Controller, Post } from '@nestjs/common'
import { AssetService } from './asset.service'
import { CreateAssetDto } from './dto/create-asset.dto'

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('')
  async createAsset(@Body() data: CreateAssetDto) {
    return this.assetService.createAsset(data.address, data.index, data.network)
  }
}
