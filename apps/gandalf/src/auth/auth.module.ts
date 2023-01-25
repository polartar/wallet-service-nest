import environment from './../environments/environment'
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfigModule } from '@nestjs/config'
import { AccountModule } from '../account/account.module'

@Module({
  // eslint-disable-next-line array-element-newline
  imports: [AccountModule, ConfigModule.forRoot({ load: [environment] })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
