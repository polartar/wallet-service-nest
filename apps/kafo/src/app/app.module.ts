import { Module } from '@nestjs/common'
import { SenderModule } from '../sender/sender.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [SenderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
