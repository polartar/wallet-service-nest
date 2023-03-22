import { Controller, Get, Query, UsePipes } from '@nestjs/common'
import { NftService } from './nft.service'
import { NftPipe } from './nft.pipe'
import { INTAssetInput } from './nft.types'

@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get()
  @UsePipes(new NftPipe())
  async getNFTAssets(@Query() query: INTAssetInput) {
    return this.nftService.getNFTAssets(query)
  }
}
