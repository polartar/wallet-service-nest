import { HttpModule } from '@nestjs/axios'
import { WalletModule } from './../wallet/wallet.module'
import { Test } from '@nestjs/testing'

import { AppService } from './app.service'
import { Environment } from '../environments/environment.dev'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from '../account/account.entity'
import { WalletEntity } from '../wallet/wallet.entity'
import { HistoryEntity } from '../wallet/history.entity'
import { AccountModule } from '../account/account.module'
import { AddressEntity } from '../wallet/address.entity'

describe('AppService', () => {
  let service: AppService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
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
      providers: [AppService],
    }).compile()

    service = app.get<AppService>(AppService)
  })

  describe('getData', () => {
    it('should return "Welcome to rick!"', () => {
      expect(service.getData()).toEqual({ message: 'Welcome to rick!' })
    })
  })
  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
