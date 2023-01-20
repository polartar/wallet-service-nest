import { SenderController } from './../../../kafo/src/sender/sender.controller';
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'

@Module({
  controllers: [SenderController],
  providers: [AuthService],
})
export class AuthModule {}
