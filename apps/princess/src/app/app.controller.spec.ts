import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from './app.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile()
  })

  describe('getData', () => {
    it('should return "Welcome to princess!"', () => {
      const appController = app.get<AppController>(AppController)
      expect(appController.welcome()).toEqual(AppService.welcomeMessage)
    })
  })
})
