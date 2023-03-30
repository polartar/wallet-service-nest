import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PairingEntity } from './pairing.entity'
import { PairingService } from './pairing.service'
import { DeviceEntity } from './device.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PairingEntity, DeviceEntity])],
  providers: [PairingService],
  exports: [PairingService],
})
export class PairingModule {}
