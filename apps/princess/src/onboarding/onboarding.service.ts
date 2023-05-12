import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Request,
  Inject,
  ForbiddenException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EAuth } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import {
  IAccount,
  IDeviceCreateResponse,
  IOnboardingSigningResponse,
} from './onboarding.types'
import * as hash from 'object-hash'
import { JwtService } from '@nestjs/jwt'
import { AccountsService } from '../accounts/accounts.service'
import * as Sentry from '@sentry/node'
import { REQUEST } from '@nestjs/core'
import { IRequest } from '../accounts/accounts.types'

@Injectable()
export class OnboardingService {
  gandalfApiUrl: string
  fluffyApiUrl: string
  rickApiUrl: string
  version: string

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private accountService: AccountsService,
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

  async createDevice(): Promise<IDeviceCreateResponse> {
    try {
      const deviceResponse = await firstValueFrom(
        this.httpService.post(`${this.fluffyApiUrl}/device`),
      )

      // create anonymous user
      const userResponse = await firstValueFrom(
        this.httpService.post(`${this.gandalfApiUrl}/account`, {
          email: `any${deviceResponse.data.deviceId}@gmail.com`,
          name: 'Anonymous',
        }),
      )

      const payload = {
        accountId: userResponse.data.id,
        idToken: deviceResponse.data.deviceId,
        deviceId: deviceResponse.data.deviceId,
      }
      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
      })
      return {
        secret: deviceResponse.data.otp,
        device_id: deviceResponse.data.deviceId,
        account_id: userResponse.data.id,
        access_token: accessToken,
      }
    } catch (err) {
      Sentry.captureException(err.message + ' in createDevice()')

      throw new BadRequestException(err.message)
    }
  }

  async signIn(
    type: EAuth,
    token: string,
    deviceId: string,
    otp: string,
    serverProposedShard: string,
    ownProposedShard: string,
    passCodeKey: string,
    recoveryKey: string,
  ): Promise<IOnboardingSigningResponse> {
    let user
    const sentry_txn = Sentry.startTransaction({
      op: 'onboarding_signIn',
      name: 'signIn method in princess',
    })
    try {
      const userResponse = await firstValueFrom(
        this.httpService.post(
          `${this.gandalfApiUrl}/auth`,
          {
            idToken: token,
            type,
          },
          { headers: { 'sentry-trace': sentry_txn.toTraceparent() } },
        ),
      )
      user = userResponse.data
    } catch (err) {
      Sentry.captureException(err, {
        extra: { message: err.message, src: 'gandalf api call of signIn()' },
      })
      if (err.response) {
        throw new UnauthorizedException(err.response.data.message)
      } else {
        throw new BadGatewayException('Gandalf API call error')
      }
    }
    Sentry.addBreadcrumb({
      category: 'signIn',
      message: 'gandalf api call done',
    })
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.rickApiUrl}/account`,
          {
            email: user.account.email,
            name: user.account.name,
            accountId: user.account.id,
          },
          { headers: { 'sentry-trace': sentry_txn.toTraceparent() } },
        ),
      )
    } catch (err) {
      Sentry.captureException(err, {
        extra: { message: err.message, src: 'rick api call of signIn()' },
      })
      if (err.response) {
        throw new InternalServerErrorException(err.response.data.message)
      } else {
        throw new BadGatewayException('Rick API call error')
      }
    }
    Sentry.addBreadcrumb({
      category: 'signIn',
      message: 'rick api call done',
    })
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.fluffyApiUrl}/pair`,
          {
            userId: user.account.id,
            deviceId,
            otp,
            serverProposedShard,
            ownProposedShard,
            passCodeKey,
            recoveryKey,
          },
          { headers: { 'sentry-trace': sentry_txn.toTraceparent() } },
        ),
      )

      const payload = {
        type: type,
        accountId: user.account.id,
        idToken: token,
        deviceId,
      }
      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
      })

      return {
        type: user.is_new ? 'new email' : 'existing email',
        account_id: user.account.id,
        account: user.is_new ? user.account : {},
        access_token: accessToken,
        server_shard: serverProposedShard,
        passcode_key: passCodeKey,
        recovery_key: recoveryKey,
      }
    } catch (err) {
      Sentry.captureException(err, {
        extra: { message: err.message, src: 'fluffy api call of signIn()' },
      })
      if (err.response) {
        throw new BadRequestException(err.response.data.message)
      } else {
        throw new BadGatewayException('Fluffy API call error')
      }
    } finally {
      Sentry.addBreadcrumb({
        category: 'signIn',
        message: 'fluffy api call done',
      })
      sentry_txn.finish()
    }
  }

  async getAccountHash(accountId: number): Promise<number> {
    const account = await this.accountService.getAccount(accountId)
    return hash(account)
  }

  async syncAccount(
    type: string,
    iHash: string,
    accountId: number,
  ): Promise<{ type: string; has_same_hash: boolean; data?: IAccount }> {
    const account = await this.accountService.getAccount(accountId)
    const oHash = hash(account)

    return {
      type,
      has_same_hash: iHash === oHash,
      data: iHash === oHash ? undefined : account,
    }
  }

  async syncUser(
    accountId: number,
    deviceId: string,
    accountHash: string,
    otp: string,
  ): Promise<{ isSync: boolean; account?: IAccount }> {
    let verifyResponse
    try {
      verifyResponse = await firstValueFrom(
        this.httpService.post(`${this.fluffyApiUrl}/verify`, {
          accountId,
          deviceId,
          token: otp,
        }),
      )
    } catch (err) {
      if (err.response) {
        Sentry.captureException(err.response.data.message + ' in syncUser()')

        throw new BadRequestException(err.response.data.message)
      }

      Sentry.captureException(err.message + ' in syncUser()')
      throw new BadGatewayException('Fluffy API call')
    }
    if (!verifyResponse.data) {
      throw new BadRequestException('Invalid otp')
    }
    const account = await this.accountService.getAccount(accountId)
    const oHash = hash(account)

    const isSync = accountHash === oHash
    return {
      isSync,
      account: isSync ? undefined : account,
    }
  }

  getVersion(): string {
    return this.version
  }

  validateAccountId(accountId: number) {
    if (Number(accountId) === Number((this.request as IRequest).accountId)) {
      return true
    } else {
      throw new ForbiddenException('Account Id not matched')
    }
  }

  validateDeviceId(deviceId: string) {
    if (deviceId === (this.request as IRequest).deviceId) {
      return true
    } else {
      throw new ForbiddenException('Device Id not matched')
    }
  }
}
