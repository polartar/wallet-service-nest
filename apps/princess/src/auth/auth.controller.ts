import { AuthService } from './auth.service'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../gateway/decorators/public.decorator'
import { UpdateAccessTokenDto } from './dto/update-access-token.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
