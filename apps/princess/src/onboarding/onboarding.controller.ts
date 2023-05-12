import { OnboardingService } from './onboarding.service'
import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common'
import { SignInValidationPipe } from './onboarding.pipe'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SyncUserDto, SyncUserResponse } from './dto/SyncUserDto'
import { Public } from '../auth/decorators/public.decorator'
import { SignInDto, SignInResponse } from './dto/SigninDto'
import { CreateDeviceResponse } from './dto/CreateDevice.dto'

@Controller('onboarding')
@ApiTags('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Public()
  @Post('device')
  @ApiOkResponse({ type: CreateDeviceResponse })
  async createDevice() {
    return this.onboardingService.createDevice()
  }

  @Post('login')
  @ApiOkResponse({ type: SignInResponse })
  @UsePipes(new SignInValidationPipe())
  async login(@Body() data: SignInDto) {
    this.onboardingService.validateDeviceId(data.device_id)

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

  @Public()
  @Get('version')
  async getVersion() {
    return this.onboardingService.getVersion()
  }

  @Post('sync')
  @ApiOkResponse({ type: SyncUserResponse })
  @ApiOperation({
    summary: 'Sync user',
  })
  async syncUser(@Body() data: SyncUserDto) {
    this.onboardingService.validateAccountId(data.account_id)

    return this.onboardingService.syncUser(
      data.account_id,
      data.device_id,
      data.account_hash,
      data.otp,
    )
  }

  // @Post('check_hash')
  // @ApiOperation({
  //   summary: 'Check Account hash',
  // })
  // async checkHash(@Body() data: SyncUserDto) {
  //   return this.onboardingService.syncUser(
  //     data.account_id,
  //     data.device_id,
  //     data.account_hash,
  //     data.otp,
  //   )
  // }
}
