import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TransactionsModule } from '../transactions/transactions.module'
import { Environment } from '../environments/environment.dev'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [Environment] }),

    TransactionsModule,
  ],
  controllers: [
    AppController, //
  ],
  providers: [
    AppService, //
  ],
})
export class AppModule {}
