import { Module } from '@nestjs/common'

import { TotpController } from '../totp/totp.controller'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [TotpController],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
