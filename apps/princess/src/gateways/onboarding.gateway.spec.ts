import { Test, TestingModule } from '@nestjs/testing'
import { OnboardingGateway } from './onboarding.gateway'

describe('OnboardingGateway', () => {
  let gateway: OnboardingGateway

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnboardingGateway],
    }).compile()

    gateway = module.get<OnboardingGateway>(OnboardingGateway)
  })

  it('should be defined', () => {
    expect(gateway).toBeDefined()
  })
})
