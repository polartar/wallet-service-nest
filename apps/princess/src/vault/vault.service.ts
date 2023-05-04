import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { EAPIMethod, IRequest } from './vault.types'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import * as Sentry from '@sentry/node'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'

@Injectable()
export class VaultService {
  bristleURL: string
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.bristleURL = this.configService.get<string>(EEnvironment.bristleAPIUrl)
  }

  getAccountIdFromRequest() {
    return Number((this.request as IRequest).accountId)
  }

  async apiCall(method: EAPIMethod, path: string, body?: unknown) {
    try {
      const url = `${this.bristleURL}/${path}`
      const res = await firstValueFrom(
        method === EAPIMethod.POST
          ? this.httpService.post<AxiosResponse>(url, body)
          : this.httpService.get<AxiosResponse>(url),
      )
      return res.data
    } catch (err) {
      if (err.response) {
        Sentry.captureException(
          `${err.response.data.message}: ${this.bristleURL}/${path} API call`,
        )
        throw new BadRequestException(err.response.data.message)
      } else {
        Sentry.captureException(
          `${err.message}: ${this.bristleURL}/${path} API call`,
        )
        throw new BadRequestException(err.message)
      }
    }
  }
  async sync(parts: string[]) {
    const obj = await this.apiCall(EAPIMethod.POST, '/sync', { parts })
    if (obj) {
      console.log(obj)
    }
  }
}
