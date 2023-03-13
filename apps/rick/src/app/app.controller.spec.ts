import { HttpModule } from '@nestjs/axios'
import { WalletModule } from './../wallet/wallet.module'
import { AccountEntity } from './../account/account.entity'
import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletEntity } from '../wallet/wallet.entity'
import { HistoryEntity } from '../wallet/history.entity'
import { AccountModule } from '../account/account.module'
import { AddressEntity } from '../wallet/address.entity'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [Environment] }),

        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [
            AccountEntity, //
            WalletEntity,
            AddressEntity,
            HistoryEntity,
          ],
        }),
        TypeOrmModule.forFeature([
          AccountEntity, //
          WalletEntity,
          AddressEntity,
          HistoryEntity,
        ]),
        AccountModule,
        WalletModule,
        HttpModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile()
  })

  describe('getData', () => {
    it('should return "Welcome to rick!"', () => {
      const appController = app.get<AppController>(AppController)
      expect(appController.getData()).toEqual({ message: 'Welcome to rick!' })
    })
  })
})
