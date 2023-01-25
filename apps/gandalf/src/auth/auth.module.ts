import { Environment } from './../environments/environment.dev'
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfigModule } from '@nestjs/config'
import { AccountModule } from '../account/account.module'

@Module({
  imports: [AccountModule,
ConfigModule.forRoot({ load: [Environment] })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
