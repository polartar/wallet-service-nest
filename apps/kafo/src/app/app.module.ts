import { Module } from '@nestjs/common'
import { SenderModule } from '../sender/sender.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TransactionModule } from '../transaction/transaction.module'

@Module({
  imports: [
    SenderModule, //
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
