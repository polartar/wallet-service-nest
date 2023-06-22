import { AuthService } from './auth.service'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../gateway/decorators/public.decorator'
import { UpdateAccessTokenDto } from './dto/update-access-token.dto'

@Controller('token')
@ApiTags('token')
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

  @Post('')
  @ApiOperation({
    summary: 'Generate new access token from the refresh token',
  })
  @Public()
  async generateAccessToken(@Body() data: UpdateAccessTokenDto) {
    return this.authService.regenerateAccessToken(
      data.account_id,
      data.device_id,
      data.otp,
      data.refresh_token,
    )
  }

  // @Post('refresh')
  // @Public()
  // @UsePipes(new RefreshTokenValidationPipe())
  // async refresh(@Body() data: RefreshTokenDto) {
  //   return this.authService.refresh(
  //     data.type,
  //     data.id_token,
  //     data.account_id,
  //     data.device_id,
  //     data.otp,
  //   )
  // }
}
