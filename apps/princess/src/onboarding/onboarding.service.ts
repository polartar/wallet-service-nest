import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
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
      const response = await firstValueFrom(
        this.httpService.post(`${this.fluffyApiUrl}/device`),
      )
      return {
        otp: response.data.otp,
        device_id: response.data.deviceId,
      }
    } catch (err) {
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
    let userResponse

    try {
      userResponse = await firstValueFrom(
        this.httpService.post(`${this.gandalfApiUrl}/auth`, {
          idToken: token,
          type,
        }),
      )
    } catch (err) {
      if (err.response) {
        throw new UnauthorizedException(err.response.data.message)
      } else {
        throw new BadGatewayException('Gandalf API call error')
      }
    }

    const user = userResponse.data
    try {
      await firstValueFrom(
        this.httpService.post(`${this.rickApiUrl}/account`, {
          email: user.account.email,
          name: user.account.name,
        }),
      )
    } catch (err) {
      if (err.response) {
        throw new InternalServerErrorException(err.response.data.message)
      } else {
        throw new BadGatewayException('Rick API call error')
      }
    }

    try {
      await firstValueFrom(
        this.httpService.post(`${this.fluffyApiUrl}/pair`, {
          userId: user.account.id,
          deviceId,
          otp,
          serverProposedShard,
          ownProposedShard,
          passCodeKey,
          recoveryKey,
        }),
      )
    } catch (err) {
      if (err.response) {
        throw new BadRequestException(err.response.data.message)
      } else {
        throw new BadGatewayException('Fluffy API call error')
      }
    }
    const payload = { type: type, accountId: user.account.id, idToken: token }
    const accessToken = await this.jwtService.signAsync(payload)

    return {
      type: user.data.is_new ? 'new email' : 'existing email',
      account_id: user.account.id,
      account: user.data.is_new ? user.account : {},
      access_token: accessToken,
      server_shard: serverProposedShard,
      passcode_key: passCodeKey,
      recovery_key: recoveryKey,
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
        throw new BadRequestException(err.response.data.message)
      }
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
}
