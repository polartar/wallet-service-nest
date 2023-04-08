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
  EOnboardingType,
  IAccount,
  IDeviceCreateResponse,
  IDeviceRegisterResponse,
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
          hardware_id: hardwareId,
        }),
      )
      return {
        success: true,
        data: {
          otp: response.data.opt,
          device_id: response.data.device_id,
        },
      }
    } catch (err) {
      return {
        success: false,
        error: err.message,
      }
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
    try {
      const { data: user } = await firstValueFrom(
        this.httpService.post(`${this.gandalfApiUrl}/auth`, {
          idToken: token,
          type,
        }),
      )

      // const pair = await this._registerDevice(user.data.account.id, deviceId)
      const { data: device } = await firstValueFrom(
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
      const onboardingType = user.data.is_new
        ? EOnboardingType.NEW_EMAIL
        : device.isNew
        ? EOnboardingType.NEW_DEVICE
        : EOnboardingType.EXISTING_ACCOUNT

      return {
        success: true,
        data: {
          type: onboardingType,
          account_id: user.account.id,
          account:
            onboardingType !== EOnboardingType.NEW_EMAIL ? user.account : {},
        },
      }
    } catch (err) {
      return {
        success: false,
        error: err.response.data.message,
      }
    }
  }

  async _registerDevice(
    accountId: number,
    deviceId: string,
    otp?: string,
  ): Promise<{ is_new: boolean }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.fluffyApiUrl}/pair`, {
          user_id: accountId,
          device_id: deviceId,
          otp,
        }),
      )
      return response.data
    } catch (err) {
      throw new BadRequestException(err?.response.data.message)
    }
  }

  async registerDevice(
    deviceId: string,
    accountId: number,
    otp: string,
  ): Promise<IDeviceRegisterResponse> {
    try {
      await this._registerDevice(accountId, deviceId, otp)

      const account = await this.getAccount(accountId)

      return {
        success: true,
        data: {
          account: account,
        },
      }
    } catch (err) {
      return {
        success: false,
        error: err.message,
      }
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

  async getAccountHash(accountId: number): Promise<number> {
    const account = await this.getAccount(accountId)
    return hash(account)
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
}
