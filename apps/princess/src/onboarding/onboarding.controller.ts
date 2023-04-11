import { OnboardingService } from './onboarding.service'
import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common'
import { SignInValidationPipe } from './onboarding.pipe'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { SyncUserDto } from './dto/SyncUserDto'
import { SignInDto } from './dto/SigninDto'

@Controller('onboarding')
@ApiTags('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('device')
  async createDevice() {
    return this.onboardingService.createDevice()
  }

  @Post('login')
  @UsePipes(new SignInValidationPipe())
  async login(@Body() data: SignInDto) {
    return this.onboardingService.signIn(
      data.type,
      data.id_token,
      data.device_id,
      data.otp,
      data.server_proposed_shard,
      data.own_proposed_shard,
      data.passcode_key,
      data.recovery_key,
    )
  }

  @Get('version')
  async getVersion() {
    return '1.0'
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Sync user',
  })
  async syncUser(@Body() data: SyncUserDto) {
    return this.onboardingService.syncUser(
      data.account_id,
      data.device_id,
      data.account_hash,
      data.otp,
    )
  }

  @Post('check_hash')
  @ApiOperation({
    summary: 'Check Account hash',
  })
  async checkHash(@Body() data: SyncUserDto) {
    return this.onboardingService.syncUser(
      data.account_id,
      data.device_id,
      data.account_hash,
      data.otp,
    )
  }
}
