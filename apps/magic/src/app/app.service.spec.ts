import { Test } from '@nestjs/testing'

import { AppService } from './app.service'
import { UR, UREncoder } from '@ngraveio/bc-ur'
import { BadRequestException } from '@nestjs/common'

describe('AppService', () => {
  let service: AppService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile()

    service = app.get<AppService>(AppService)
  })

  it('should return "Welcome to magic!"', () => {
    expect(service.welcomeMessage).toEqual(AppService.welcomeMessage)
  })
})
