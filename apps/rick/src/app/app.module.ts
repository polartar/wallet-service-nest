import { AddressEntity } from './../wallet/address.entity'
import { PortfolioModule } from './../portfolio/portfolio.module'
import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { WalletModule } from '../wallet/wallet.module'
import { NftModule } from '../nft/nft.module'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from '../wallet/wallet.entity'
import { AccountEntity } from '../account/account.entity'
import { HistoryEntity } from '../wallet/history.entity'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [Environment] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5431,
      username: 'myusername',
      password: 'mypassword',
      database: 'rick',
      entities: [
        AccountEntity, //
        WalletEntity,
      ],
      // TODO: Maybe disable in production?
      autoLoadEntities: true,
      synchronize: true,
    }),

    PortfolioModule, //
    WalletModule,
    NftModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
