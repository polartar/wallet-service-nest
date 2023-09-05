import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TotpController } from './totp.controller'
import { TotpService } from './totp.service'
import { DeviceEntity } from './device.entity'

@Module({
  imports: [TypeOrmModule.forFeature([DeviceEntity])],
  providers: [TotpService],
  controllers: [TotpController],
})
export class TotpModule {}
