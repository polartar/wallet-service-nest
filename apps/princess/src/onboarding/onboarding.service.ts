import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EAuth } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { IOnboardingSigninResponse } from './onboarding.types'

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

  async signIn(type: EAuth, token: string) {
    try {
      firstValueFrom(
        this.httpService.post(`${this.gandalfApiUrl}/auth`, {
          idToken: token,
          type,
        }),
      )
    } catch (err) {
      console.error('Error')
    }
  }
  async registerDevice(deviceId: string): Promise<IOnboardingSigninResponse> {
    const accountId = 'testAccount' // we should repalce later
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
