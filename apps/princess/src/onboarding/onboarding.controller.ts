import { OnboardingService } from './onboarding.service'
import { IOnboardingSignIn } from './onboarding.types'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common'
import { SignInValidationPipe } from './onbording.pipe'

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('device')
  async createDevice(@Body('hardware_ud') hardwareId: string) {
    return this.onboardingService.createDevice(hardwareId)
  }

  @Post('login')
  @UsePipes(new SignInValidationPipe())
  async login(@Body() data: IOnboardingSignIn) {
    try {
      this.onboardingService.signIn(data.type, data.token, data.device_id)
    } catch (e) {
      throw new BadRequestException(e?.message)
    }
  }

  @Post('device/:device_id/register')
  async registerDevice(
    @Param('device_id') deviceId: string,
    @Body('account_id') accountId: string,
    @Body('otp') otp: string,
  ) {
    return this.onboardingService.registerDevice(deviceId, accountId, otp)
  }

  @Get('account/hash/:account_id')
  async getAccount(@Param('account_id') accountId: string) {
    return this.onboardingService.getAccountHash(accountId)
  }
}
