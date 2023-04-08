import { OnboardingService } from './onboarding.service'
import { IOnboardingSignIn } from './onboarding.types'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
} from '@nestjs/common'
import { SignInValidationPipe } from './onboarding.pipe'
import { RegisterDeviceDto } from './dto/RegisterDevice.dto'
import { ApiTags } from '@nestjs/swagger'

@Controller('onboarding')
@ApiTags('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('device')
  async createDevice(@Body('hardware_id') hardwareId: string) {
    if (!hardwareId) {
      throw new BadRequestException('hardware_id required')
    }
    return this.onboardingService.createDevice(hardwareId)
  }

  @Post('login')
  @UsePipes(new SignInValidationPipe())
  async login(@Body() data: IOnboardingSignIn) {
    return this.onboardingService.signIn(data.type, data.token, data.device_id)
  }

  @Post('device/:device_id/register')
  async registerDevice(
    @Param('device_id', ParseUUIDPipe) deviceId: string,
    @Body() data: RegisterDeviceDto,
  ) {
    return this.onboardingService.registerDevice(
      deviceId,
      data.account_id,
      data.opt,
    )
  }

  @Get('account/hash/:account_id')
  async getAccount(@Param('account_id') accountId: number) {
    if (!accountId) {
      throw new BadRequestException('account_id required')
    }
    return this.onboardingService.getAccountHash(accountId)
  }
}
