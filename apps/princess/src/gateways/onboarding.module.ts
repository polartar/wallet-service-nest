import { Module } from '@nestjs/common'
import { OnboardingGateway } from './onboarding.gateway'
import { OnboardingService } from '../onboarding/onboarding.service'

@Module({
  providers: [
    OnboardingGateway, //
    OnboardingService,
  ],
})
export class RickModule {}
