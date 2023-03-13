import { Module } from '@nestjs/common'
import { TransactionController } from './transaction.controller'
import { TransactionService } from './transaction.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from './../environments/environment.dev'

@Module({
  imports: [
    ConfigModule.forRoot({ load: [Environment] }), //
    HttpModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
