import { Module } from '@nestjs/common'
import { AnonGateway } from '../gateways/anon.gateway'
import { AnonModule } from '../gateways/anon.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [AnonModule],
  controllers: [AppController],
  providers: [
    AnonGateway, //
    AppService,
  ],
})
export class AppModule {}
