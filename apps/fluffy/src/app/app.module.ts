import { Module } from '@nestjs/common'

import { TotpModule } from '../totp/totp.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [TotpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
