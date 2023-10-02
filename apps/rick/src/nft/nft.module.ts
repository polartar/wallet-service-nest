import { Module } from '@nestjs/common'
import { NftService } from './nft.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NftEntity } from '../wallet/nft.entity'

@Module({
  imports: [TypeOrmModule.forFeature([NftEntity])],
  providers: [NftService],
})
export class NftModule {}
