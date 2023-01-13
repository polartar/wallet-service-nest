import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PairingEntity } from './pairing.entity'
import { PairingService } from './pairing.service'

@Module({
  imports: [TypeOrmModule.forFeature([PairingEntity])],
  providers: [PairingService],
  exports: [PairingService],
})
export class PairingModule {}
