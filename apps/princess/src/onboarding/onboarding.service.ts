import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EAuth } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import {
  EOnboardingType,
  IOnboardingDeviceResponse,
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

      const pair = await this.registerDevice(user.data.account.id, deviceId)
      const onboardingType = user.data.isNew
        ? EOnboardingType.NEW_EMAIL
        : pair.data.isNew
        ? EOnboardingType.NEW_DEVICE
        : EOnboardingType.EXISTING_ACCOUNT

      return {
        success: true,
        data: {
          type: onboardingType,
          id: user.data.account.id,
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
  async registerDevice(
    accountId: string,
    deviceId: string,
  ): Promise<IOnboardingDeviceResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.fluffyApiUrl}/pair`, {
          accountId,
          deviceId,
        }),
      )
      return {
        success: true,
        data: {
          otp: response.data.totp,
          id: response.data.userId,
          isNew: response.data.isNew,
        },
      }
    } catch (err) {
      return {
        success: false,
        error: err.message,
      }
    }
  }
}
