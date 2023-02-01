import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AccountEntity } from '../account/account.entity'
import { WalletEntity } from '../wallet/wallet.entity'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
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
