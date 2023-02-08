import { Module } from '@nestjs/common'
import { RickGateway } from './rick.gateway'

@Module({
  providers: [RickGateway],
})
export class RickModule {}
