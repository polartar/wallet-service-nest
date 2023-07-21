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
import { EAuth } from '@rana/core'

@Injectable()
export class AuthService {
  gandalfApiUrl: string
  fluffyApiUrl: string
  rickApiUrl: string
  version: string

  constructor(
    private configService: ConfigService,
    private accountService: AccountsService,
    private bootstrapService: BootstrapService,
    private jwtService: JwtService,
  ) {
    this.gandalfApiUrl = this.configService.get<string>(
      EEnvironment.gandalfAPIUrl,
    )
    this.fluffyApiUrl = this.configService.get<string>(
      EEnvironment.fluffyAPIUrl,
    )
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
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
    accountId: string,
    deviceId: string,
    otp: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (provider === EAuth.Google || provider === EAuth.Apple) {
      const userResponse = await this.accountService.getUserFromIdToken(
        providerToken,
        provider,
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
