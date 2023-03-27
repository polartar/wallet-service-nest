import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'

@Injectable()
export class OnboardingService {
  gandalfApiUrl: string
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.gandalfApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
  }
}
