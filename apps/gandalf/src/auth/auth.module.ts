import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { AccountModule } from '../account/account.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TotpService } from '../totp/totp.service'
import { TotpModule } from '../totp/totp.module'
import { DeviceEntity } from '../totp/device.entity'

@Module({
  imports: [
    AccountModule,
    TotpModule,
    TypeOrmModule.forFeature([DeviceEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, TotpService],
})
export class AuthModule {}
