import {
  BadRequestException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { JwtService } from '@nestjs/jwt'
import { AccountsService } from '../accounts/accounts.service'
import { BootstrapService } from '../bootstrap/bootstrap.service'
import { IAccessTokenPayload } from '../bootstrap/bootstrap.types'
import { EAuth, EPlatform } from '@rana/core'

@Injectable()
export class AuthService {
  version: string

  constructor(
    private configService: ConfigService,
    private accountService: AccountsService,
    private bootstrapService: BootstrapService,
    private jwtService: JwtService,
  ) {
    this.version = this.configService.get<string>(EEnvironment.version)
  }

  async generateAccessToken(
    accountId: string,
    deviceId: string,
    otp: string,
    refreshToken: string,
  ) {
    let payload: IAccessTokenPayload
    try {
      payload = await this.jwtService.verifyAsync<IAccessTokenPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>(
            EEnvironment.jwtRefreshTokenSecret,
          ),
        },
      )
    } catch (err) {
      throw new ForbiddenException('Invalid refresh token')
    }

    if (payload.accountId !== accountId || payload.deviceId !== deviceId) {
      throw new BadRequestException(
        "Wrong refresh token. The payload isn't matched",
      )
    }

    await this.accountService.checkPair(accountId, deviceId, otp)

    const newPayload = {
      type: payload.type,
      accountId: accountId,
      deviceId,
    }

    const accessToken = this.bootstrapService.generateAccessToken(newPayload)

    return accessToken
  }

  async generateRefreshToken(
    provider: EAuth | 'Anonymous',
    providerToken: string,
    platform: EPlatform,
    accountId: string,
    deviceId: string,
    otp: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (provider === EAuth.Google || provider === EAuth.Apple) {
      const userResponse = await this.accountService.getUserFromIdToken(
        providerToken,
        provider,
        platform,
        accountId,
      )
      if (accountId !== userResponse.account.id) {
        throw new ForbiddenException(`Wrong account Id: ${accountId}`)
      }
      await this.accountService.syncRick(
        userResponse.is_new,
        userResponse.account,
        accountId,
      )
    }

    await this.accountService.checkPair(accountId, deviceId, otp)

    const payload = {
      type: provider,
      accountId: accountId,
      deviceId,
    }
    const refreshToken = await this.bootstrapService.generateRefreshToken(
      payload,
    )
    const accessToken = await this.bootstrapService.generateAccessToken(payload)

    return {
      accessToken,
      refreshToken,
    }
  }
}
