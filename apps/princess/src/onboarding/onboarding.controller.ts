import { OnboardingService } from './onboarding.service'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UsePipes,
} from '@nestjs/common'
import { SignInValidationPipe } from './onboarding.pipe'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { SyncUserDto } from './dto/SyncUserDto'
import { Public } from '../auth/decorators/public.decorator'
import { REQUEST } from '@nestjs/core'
import { Request } from 'express'
import { IRequest } from '../accounts/accounts.typs'
import { SignInDto } from './dto/SignInDto'

@Controller('onboarding')
@ApiTags('onboarding')
export class OnboardingController {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly onboardingService: OnboardingService,
  ) {}

  validateAccountId(accountId: number) {
    if (accountId === Number((this.request as IRequest).accountId)) {
      return true
    } else {
      throw new BadRequestException('Account Id  not matched')
    }
  }

  @Public()
  @Post('device')
  async createDevice() {
    return this.onboardingService.createDevice()
  }

  @Public()
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

  @Public()
  @Get('version')
  async getVersion() {
    return this.onboardingService.getVersion()
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Sync user',
  })
  async syncUser(@Body() data: SyncUserDto) {
    this.validateAccountId(data.account_id)

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
