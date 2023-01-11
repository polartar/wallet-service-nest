import { Module } from '@nestjs/common'
import { TotpController } from './totp.controller'
import { TotpService } from './totp.service'

@Module({
  providers: [TotpService],
  controllers: [TotpController],
})
export class TotpModule {}
