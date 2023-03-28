import { OnboardingService } from './onboarding.service'
import { IOnboardingSignIn } from './onboarding.types'
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { SignInValidationPipe } from './onbording.pipe'
import { RegisterDeviceDto } from './dto/RegisterDeviceDto'

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('device')
  async registerDevice(@Body(ValidationPipe) data: RegisterDeviceDto) {
    return this.onboardingService.registerDevice(data.device_id)
  }

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
