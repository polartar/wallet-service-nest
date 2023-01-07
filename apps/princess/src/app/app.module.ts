import { Module } from '@nestjs/common'
import { AnonModule } from '../gateways/anon.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [AnonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
