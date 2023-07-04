import { Module } from '@nestjs/common'
import { OnboardingGateway } from './onboarding.gateway'
import { AuthService } from '../auth/auth.service'

@Module({
  providers: [
    OnboardingGateway, //
    AuthService,
  ],
})
export class RickModule {}
