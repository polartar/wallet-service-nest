import { AuthService } from './auth.service'
import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../gateway/decorators/public.decorator'
import { UpdateAccessTokenDto } from './dto/update-access-token.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { RefreshTokenValidationPipe } from './auth.pipe'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('login')
  // @ApiOkResponse({ type: SignInSwaggerResponse })
  // @UsePipes(new SignInValidationPipe())
  // async login(@Body() data: SignInDto) {
  //   this.authService.validateDeviceId(data.device_id)

  //   return this.authService.signIn(
  //     data.type,
  //     data.id_token,
  //     data.device_id,
  //     data.otp,
  //     data.server_proposed_shard,
  //     data.own_proposed_shard,
  //     data.passcode_key,
  //     data.recovery_key,
  //   )
  // }

  // @Post('sync')
  // @ApiOkResponse({ type: SyncUserSwaggerResponse })
  // @ApiOperation({
  //   summary: 'Sync user',
  // })
  // async syncUser(@Body() data: SyncUserDto) {
  //   this.authService.validateAccountId(data.account_id)

  //   return this.authService.syncUser(
  //     data.account_id,
  //     data.device_id,
  //     data.account_hash,
  //     data.otp,
  //   )
  // }

  @Post('/access-token')
  @ApiOperation({
    summary: 'Generate new access token from the refresh token',
  })
  @Public()
  async generateAccessToken(@Body() data: UpdateAccessTokenDto) {
    return this.authService.generateAccessToken(
      data.accountId,
      data.deviceId,
      data.otp,
      data.refreshToken,
    )
  }

  @Post('/refresh-token')
  @ApiOperation({
    summary: 'Generate new refresh token and access token',
  })
  @Public()
  @UsePipes(new RefreshTokenValidationPipe())
  async refresh(@Body() data: RefreshTokenDto) {
    return this.authService.generateRefreshToken(
      data.provider,
      data.providerToken,
      data.accountId,
      data.deviceId,
      data.otp,
    )
  }
}
