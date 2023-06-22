import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Injectable,
  Request,
  Inject,
  ForbiddenException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { JwtService } from '@nestjs/jwt'
import { AccountsService } from '../accounts/accounts.service'
import { REQUEST } from '@nestjs/core'
import { BootstrapService } from '../bootstrap/bootstrap.service'
import { IAccessTokenPayload } from '../bootstrap/bootstrap.types'

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

  async regenerateAccessToken(
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

    if (
      +payload.accountId !== accountId ||
      payload.deviceId !== deviceId ||
      payload.otp !== otp
    ) {
      throw new BadRequestException(
        "Wrong refresh token. The payload isn't matched",
      )
    }

    const accessToken = this.bootstrapService.generateAccessToken(payload)

    return accessToken
  }

  // async refresh(
  //   type: EAuth | 'Anonymous',
  //   idToken: string,
  //   accountId: number,
  //   deviceId: string,
  //   otp: string,
  // ): Promise<string> {
  //   if (type === EAuth.Google || type === EAuth.Apple) {
  //     const userResponse = await this.getUserFromIdToken(idToken, type)
  //     if (accountId !== userResponse.account.id) {
  //       throw new ForbiddenException(`Wrong account Id: ${accountId}`)
  //     }
  //     await this.syncRick(userResponse.is_new, userResponse.account, accountId)
  //   }

  //   const pair = await this.checkPair(
  //     accountId,
  //     false,
  //     {},
  //     type,
  //     idToken,
  //     deviceId,
  //     otp,
  //   )
  //   return pair.refresh_token
  // }
}
