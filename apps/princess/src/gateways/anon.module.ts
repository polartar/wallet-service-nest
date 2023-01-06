import { Module } from '@nestjs/common'
import { AnonGateway } from './anon.gateway'

@Module({
  providers: [AnonGateway],
})
export class AnonModule {}
