import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EAuth } from '@rana/core'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class OnboardingService {
  gandalfApiUrl: string
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.gandalfApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
  }

  async signIn(type: EAuth, token: string) {
    try {
      firstValueFrom(
        this.httpService.post(`${this.gandalfApiUrl}/auth`, {
          idToken: token,
          type,
        }),
      )
    } catch (err) {}
  }
}
