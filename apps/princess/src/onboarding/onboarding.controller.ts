import { OnboardingService } from './onboarding.service'
import { IOnboardingSignIn } from './onboarding.types'
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common'
import { SignInValidationPipe } from './onbording.pipe'

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('login')
  @UsePipes(new SignInValidationPipe())
  async login(@Body() data: IOnboardingSignIn) {
    try {
      this.onboardingService.signIn(data.type, data.token)
    } catch (e) {
      throw new BadRequestException(e?.message)
    }
  }
}
