import { Module } from '@nestjs/common'
import { NftService } from './nft.service'

@Module({
  providers: [NftService],
})
export class NftModule {}
