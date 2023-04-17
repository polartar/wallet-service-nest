import { Test, TestingModule } from '@nestjs/testing'
import { OnboardingService } from './onboarding.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Environment } from '../environments/environment.dev'
import { AccountsService } from '../accounts/accounts.service'
import { JwtService } from '@nestjs/jwt'
import { UR, UREncoder } from '@ngraveio/bc-ur'

describe('OnboardingService', () => {
  let service: OnboardingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule, //
        ConfigModule.forRoot({ load: [Environment] }),
      ],
      providers: [OnboardingService, AccountsService, JwtService],
    }).compile()

    service = module.get<OnboardingService>(OnboardingService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should verify the payload', () => {
    const message1 = { message1: 'property1' }
    const messageBuffer1 = Buffer.from(JSON.stringify(message1))

    const message2 = { message2: 'property2' }
    const messageBuffer2 = Buffer.from(JSON.stringify(message2))

    const ur1 = UR.fromBuffer(messageBuffer1)
    const ur2 = UR.fromBuffer(messageBuffer2)
    const maxFragmentLength = 150
    const firstSeqNum = 0

    const encoder1 = new UREncoder(ur1, maxFragmentLength, firstSeqNum)
    const encoder2 = new UREncoder(ur2, maxFragmentLength, firstSeqNum)

    const part1 = encoder1.nextPart()
    const part2 = encoder2.nextPart()

    expect(
      service.verifyPayload([
        {
          part: part1,
          message: JSON.stringify(message1),
        },
        {
          part: part2,
          message: JSON.stringify(message2),
        },
      ]),
    ).toBeTruthy()
  })
})
