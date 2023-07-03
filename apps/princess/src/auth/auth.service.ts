import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Injectable,
  Request,
  Inject,
  ForbiddenException,
  BadGatewayException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { JwtService } from '@nestjs/jwt'
import { AccountsService } from '../accounts/accounts.service'
import { REQUEST } from '@nestjs/core'
import { BootstrapService } from '../bootstrap/bootstrap.service'
import { IAccessTokenPayload } from '../bootstrap/bootstrap.types'
import * as Sentry from '@sentry/node'
import { EAuth } from '@rana/core'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class AuthService {
  gandalfApiUrl: string
  fluffyApiUrl: string
  rickApiUrl: string
  version: string

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private accountService: AccountsService,
    private bootstrapService: BootstrapService,
    private jwtService: JwtService,
    @Inject(REQUEST) private readonly request: Request,
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

  // async getAccountHash(accountId: number): Promise<number> {
  //   const account = await this.accountService.getAccount(accountId)
  //   return hash(account)
  // }

  // async syncAccount(
  //   type: string,
  //   iHash: string,
  //   accountId: number,
  // ): Promise<{ type: string; has_same_hash: boolean; data?: IAccount }> {
  //   const account = await this.accountService.getAccount(accountId)
  //   const oHash = hash(account)

  //   return {
  //     type,
  //     has_same_hash: iHash === oHash,
  //     data: iHash === oHash ? undefined : account,
  //   }
  // }

  // async syncUser(
  //   accountId: number,
  //   deviceId: string,
  //   accountHash: string,
  //   otp: string,
  // ): Promise<{ isSync: boolean; account?: IAccount }> {
  //   let verifyResponse
  //   try {
  //     verifyResponse = await firstValueFrom(
  //       this.httpService.post(`${this.fluffyApiUrl}/verify`, {
  //         accountId,
  //         deviceId,
  //         token: otp,
  //       }),
  //     )
  //   } catch (err) {
  //     if (err.response) {
  //       Sentry.captureException(err.response.data.message + ' in syncUser()')

  //       throw new BadRequestException(err.response.data.message)
  //     }

  //     Sentry.captureException(err.message + ' in syncUser()')
  //     throw new BadGatewayException('Fluffy API call')
  //   }
  //   if (!verifyResponse.data) {
  //     throw new BadRequestException('Invalid otp')
  //   }
  //   const account = await this.accountService.getAccount(accountId)
  //   const oHash = hash(account)

  //   const isSync = accountHash === oHash
  //   return {
  //     isSync,
  //     account: isSync ? undefined : account,
  //   }
  // }

  // getAccountIdFromRequest(): number {
  //   return Number((this.request as IRequest).accountId)
  // }

  // validateAccountId(accountId: number) {
  //   if (Number(accountId) === this.getAccountIdFromRequest()) {
  //     return true
  //   } else {
  //     throw new ForbiddenException('Account Id not matched')
  //   }
  // }

  // validateDeviceId(deviceId: string) {
  //   if (deviceId === (this.request as IRequest).deviceId) {
  //     return true
  //   } else {
  //     throw new ForbiddenException('Device Id not matched')
  //   }
  // }

  async generateAccessToken(
    accountId: number,
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

    if (+payload.accountId !== accountId || payload.deviceId !== deviceId) {
      throw new BadRequestException(
        "Wrong refresh token. The payload isn't matched",
      )
    }

    await this.accountService.checkPair(accountId, deviceId, otp)

    const newPayload = {
      type: payload.type,
      accountId: accountId,
      idToken: payload.idToken,
      deviceId,
    }

    const accessToken = this.bootstrapService.generateAccessToken(newPayload)

    return accessToken
  }

  async generateRefreshToken(
    provider: EAuth | 'Anonymous',
    providerToken: string,
    accountId: number,
    deviceId: string,
    otp: string,
  ): Promise<string> {
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
      idToken: providerToken,
      deviceId,
    }
    return await this.bootstrapService.generateRefreshToken(payload)
  }
}
