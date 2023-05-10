import { Module } from '@nestjs/common'
import { VaultController } from './vault.controller'
import { VaultService } from './vault.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [VaultController],
  providers: [VaultService],
})
export class VaultModule {}
