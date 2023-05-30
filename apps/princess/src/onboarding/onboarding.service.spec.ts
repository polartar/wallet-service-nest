import { Test, TestingModule } from '@nestjs/testing'
import { OnboardingService } from './onboarding.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { AccountsService } from '../accounts/accounts.service'
import { JwtService } from '@nestjs/jwt'
import { MarketService } from '../market/market.service'
import { TransactionService } from '../transaction/transaction.service'

describe('OnboardingService', () => {
  let service: OnboardingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [
        OnboardingService,
        AccountsService,
        JwtService,
        MarketService,
        TransactionService,
      ],
    }).compile()

    service = module.get<OnboardingService>(OnboardingService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
