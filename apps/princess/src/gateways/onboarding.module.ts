import { Module } from '@nestjs/common'
import { OnboardingGateway } from './onboarding.gateway'
import { OnboardingService } from '../auth/auth.service'

@Module({
  providers: [
    OnboardingGateway, //
    OnboardingService,
  ],
})
export class RickModule {}
