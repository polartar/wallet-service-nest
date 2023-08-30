import { Test } from '@nestjs/testing'

import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'

describe('AppService', () => {
  let service: AppService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [Environment] })],
      providers: [AppService],
    }).compile()

    service = app.get<AppService>(AppService)
  })

  describe('getData', () => {
    it('should return "Welcome to kafo!"', () => {
      expect(service.welcome).toEqual(AppService.welcomeMessage)
    })
  })
})
