import { HttpService } from '@nestjs/axios'
import { BadRequestException, HttpException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EAuth } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import {
  EOnboardingType,
  IDeviceCreateResponse,
  IDeviceRegisterResponse,
  IOnboardingSigningResponse,
} from './onboarding.types'

@Injectable()
export class OnboardingService {
  gandalfApiUrl: string
  fluffyApiUrl: string
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.gandalfApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
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
  ): Promise<IOnboardingSigningResponse> {
    try {
      const user = await firstValueFrom(
        this.httpService.post(`${this.gandalfApiUrl}/auth`, {
          idToken: token,
          type,
        }),
      )

      const pair = await this._registerDevice(user.data.account.id, deviceId)
      const onboardingType = user.data.is_new
        ? EOnboardingType.NEW_EMAIL
        : pair.is_new
        ? EOnboardingType.NEW_DEVICE
        : EOnboardingType.EXISTING_ACCOUNT

      return {
        success: true,
        data: {
          type: onboardingType,
          account_id: user.data.account.id,
          account:
            onboardingType !== EOnboardingType.NEW_EMAIL
              ? user.data.account
              : {},
        },
      }
    } catch (err) {
      return {
        success: false,
        error: err.message,
      }
    }
  }

  async _registerDevice(
    accountId: string,
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
      throw new BadRequestException(err?.message)
    }
  }

  async registerDevice(
    accountId: string,
    deviceId: string,
    otp?: string,
  ): Promise<IDeviceRegisterResponse> {
    try {
      const response = await this._registerDevice(accountId, deviceId, otp)
      // how to get account object?
      return {
        success: true,
        // data: {},
      }
    } catch (err) {
      return {
        success: false,
        error: err.message,
      }
    }
  }
}
