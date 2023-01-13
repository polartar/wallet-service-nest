import { Test, TestingModule } from '@nestjs/testing'

import { TotpController } from './totp.controller'
import { TotpService } from './totp.service'

describe('TotpController', () => {
  let controller: TotpController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TotpController],
      providers: [TotpService],
    }).compile()

    controller = module.get<TotpController>(TotpController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
