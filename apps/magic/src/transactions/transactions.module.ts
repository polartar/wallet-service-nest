/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { TransactionsController } from './transactions.controller'
import { TransactionEntity } from 'apps/rick/src/wallet/transaction.entity'
import { AssetEntity } from './../../../rick/src/wallet/asset.entity'
import { HttpModule } from '@nestjs/axios'
import { WalletEntity } from 'apps/rick/src/wallet/wallet.entity'
import { AccountEntity } from 'apps/rick/src/account/account.entity'

@Module({
  imports: [
    HttpModule.register({
      timeout: 600000, // 10 mins
      maxRedirects: 2,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.RICK_DB_HOST || 'localhost',
      port: parseInt(process.env.RICK_DB_PORT) || 5431,
      username: process.env.RICK_DB_USERNAME || 'myusername',
      password: process.env.RICK_DB_PASSWORD || 'mypassword',
      database: process.env.RICK_DB_NAME || 'rick',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      AssetEntity,
      TransactionEntity,
      WalletEntity,
      AccountEntity,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
