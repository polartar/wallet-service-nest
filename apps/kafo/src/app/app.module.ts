import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TransactionModule } from '../transaction/transaction.module'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { SyncModule } from '../sync/sync.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [Environment] }),
    TransactionModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
