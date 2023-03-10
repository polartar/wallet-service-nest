import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { ESort, INewsQuery, INewsResponse } from './news.types'

@Injectable()
export class NewsService {
  private fidelityAccessToken: string
  private fidelityClientId: string
  private fidelityClientSecret: string
  private expiredAt: number
  defaultCountPerPage = 10

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.fidelityClientId = this.configService.get<string>(
      EEnvironment.fidelityClientId,
    )
    this.fidelityClientSecret = this.configService.get<string>(
      EEnvironment.fidelityClientSecret,
    )

    this.getAuthToken()
  }

  // We may need to define global function?
  private async getAuthToken() {
    const params = new URLSearchParams()
    params.append('client_id', this.fidelityClientId)
    params.append('client_secret', this.fidelityClientSecret)

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api-live.fidelity.com/oauth/client_credential/accesstoken?grant_type=client_credentials`,
          params,
          config,
        ),
      )

      this.expiredAt = new Date().getTime() + 3590 * 1000

      this.fidelityAccessToken = response.data.access_token
    } catch (err) {
      Logger.error(err.message)
    }
  }

  async getTopNews(count: number): Promise<INewsResponse> {
    const apiURL = `https://api-live.fidelity.com/crypto-asset-analytics/v1/crypto/analytics/news/?sort=desc&limit=${count}`
    try {
      if (new Date().getTime() >= this.expiredAt) {
        await this.getAuthToken()
      }

      const res: { data: unknown } = await firstValueFrom(
        this.httpService.get<AxiosResponse>(apiURL, {
          headers: { Authorization: `Bearer ${this.fidelityAccessToken}` },
        }),
      )
      return {
        success: true,
        data: (res.data as { news: [] }).news,
      }
    } catch (err) {
      Logger.error(err.message)
      return {
        success: false,
        error: JSON.stringify(err.response.data),
      }
    }
  }

  async getNews(query: INewsQuery): Promise<INewsResponse> {
    const pageNumber = query.pageNumber || 1
    const countPerPage = query.countPerPage || this.defaultCountPerPage
    const skip = (pageNumber - 1) * countPerPage
    let params = `?limit=${countPerPage}&skip=${skip}`

    if (query.sort === ESort.DESC) {
      params += '&sort=desc'
    } else {
      params += '&sort=asc'
    }
    if (query.startTime) {
      params += `&startTime=${query.startTime}`
    }
    if (query.endTime) {
      params += `&endTime=${query.endTime}`
    }

    const apiURL = `https://api-live.fidelity.com/crypto-asset-analytics/v1/crypto/analytics/news/${params}`
    try {
      if (new Date().getTime() >= this.expiredAt) {
        await this.getAuthToken()
      }

      const res: { data: unknown } = await firstValueFrom(
        this.httpService.get<AxiosResponse>(apiURL, {
          headers: { Authorization: `Bearer ${this.fidelityAccessToken}` },
        }),
      )
      return {
        success: true,
        data: {
          news: (res.data as { news: [] }).news,
          total: (res.data as { total: number }).total,
          currentPage: pageNumber,
        },
      }
    } catch (err) {
      Logger.error(err.message)
      return {
        success: false,
        error: JSON.stringify(err.response.data),
      }
    }
  }
}
