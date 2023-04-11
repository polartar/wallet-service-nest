import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
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
@Injectable()
export class OnboardingService {
  gandalfApiUrl: string
  fluffyApiUrl: string
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.gandalfApiUrl = this.configService.get<string>(
      EEnvironment.gandalfAPIUrl,
    )
    this.fluffyApiUrl = this.configService.get<string>(
      EEnvironment.fluffyAPIUrl,
    )
  }

  async createDevice(hardwareId: string): Promise<IDeviceCreateResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.fluffyApiUrl}/device`, {
          hardwareId,
        }),
      )
      return {
        otp: response.data.otp,
        device_id: response.data.device_id,
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
        throw new BadRequestException(err.response.data.message)
      } else {
        throw new BadGatewayException('Gandalf API call error')
      }
    }

    const user = userResponse.data
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

    return {
      type: user.data.is_new ? 'new email' : 'existing email',
      account_id: user.account.id,
      account: user.data.is_new ? user.account : {},
      access_token: '',
      server_shard: serverProposedShard,
      passcode_key: passCodeKey,
      recovery_key: recoveryKey,
    }
  }

  async getAccount(accountId: number): Promise<IAccount> {
    try {
      const accountResponse = await firstValueFrom(
        this.httpService.get(`${this.gandalfApiUrl}/auth/${accountId}`),
      )
      return accountResponse.data
    } catch (err) {
      throw new BadGatewayException(err.message)
    }
  }

  async syncAccount(
    type: string,
    iHash: string,
    accountId: number,
  ): Promise<{ type: string; has_same_hash: boolean; data?: IAccount }> {
    const account = await this.getAccount(accountId)
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
      throw new BadGatewayException('Fluffy API call')
    }
    if (!verifyResponse.data) {
      throw new BadRequestException('Invalid otp')
    }
    const account = await this.getAccount(accountId)
    const oHash = hash(account)

    const isSync = accountHash === oHash
    return {
      isSync,
      account: isSync ? undefined : account,
    }
  }
}
