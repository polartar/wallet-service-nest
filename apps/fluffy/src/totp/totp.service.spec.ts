import { Test, TestingModule } from '@nestjs/testing'
import { TotpService } from './totp.service'

describe('TotpService', () => {
  let service: TotpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TotpService],
    }).compile()

    service = module.get<TotpService>(TotpService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
