import { Environment } from './../environments/environment.dev'
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule.forRoot({ load: [Environment] })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
