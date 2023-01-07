import { Test, TestingModule } from '@nestjs/testing'
import { AnonGateway } from './anon.gateway'

describe('AnonGateway', () => {
  let gateway: AnonGateway

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnonGateway],
    }).compile()

    gateway = module.get<AnonGateway>(AnonGateway)
  })

  it('should be defined', () => {
    expect(gateway).toBeDefined()
  })
})
