import { Test, TestingModule } from '@nestjs/testing'
import { OnboardingService } from './onboarding.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'

describe('OnboardingService', () => {
  let service: OnboardingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [OnboardingService],
    }).compile()

    service = module.get<OnboardingService>(OnboardingService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
