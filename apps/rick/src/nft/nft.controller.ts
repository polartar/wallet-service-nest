import { Controller, Get, Param, UsePipes } from '@nestjs/common'
import { NftService } from './nft.service'
import { NftPipe } from './nft.pipe'

@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get(':address')
  @UsePipes(new NftPipe())
  async getNFTAssets(@Param('address') address: string) {
    return this.nftService.getNFTAssets(address)
  }
}
