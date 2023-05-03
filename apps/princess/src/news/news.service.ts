import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { ESort, INewsQuery, INewsResponse } from './news.types'
import { ECoinType } from '@rana/core'
import * as Sentry from '@sentry/node'

@Injectable()
export class NewsService {
  private fidelityAccessToken: string
  private fidelityClientId: string
  private fidelityClientSecret: string
  private expiredAt: number
  defaultCountPerPage = 10
  defaultTopCount = 3

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
      Sentry.captureException(err.message + ' in getAuthToken()')
    }
  }

  async getLatestNews(
    count?: number,
    symbol?: ECoinType,
  ): Promise<INewsResponse> {
    const news = await this.getNews({
      sort: ESort.DESC,
      countPerPage: count || this.defaultTopCount,
      symbol,
    })
    if (news.success) {
      return {
        success: true,
        data: news.data.news,
      }
    } else {
      return news
    }
  }

  generateParams(query: INewsQuery): string {
    const skip = (query.pageNumber - 1) * query.countPerPage
    let params = `?limit=${query.countPerPage}&skip=${skip}`

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
    if (query.symbol) {
      params += `&symbols=${query.symbol}`
    } else {
      params += `&symbols=${ECoinType.BITCOIN},${ECoinType.ETHEREUM}`
    }
    return params
  }

  async getNews(query: INewsQuery): Promise<INewsResponse> {
    const newQuery = query
    newQuery.pageNumber = query.pageNumber || 1
    newQuery.countPerPage = query.countPerPage || this.defaultCountPerPage

    const params = this.generateParams(newQuery)
    const apiURL = `https://api-live.fidelity.com/crypto-asset-analytics/v1/crypto/analytics/news/${params}`

    try {
      if (!this.expiredAt || new Date().getTime() >= this.expiredAt) {
        await this.getAuthToken()
      }
      await this.getAuthToken()
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
          currentPage: newQuery.pageNumber,
          countPerPage: newQuery.countPerPage,
        },
      }
    } catch (err) {
      Sentry.captureException(err.message + ' in getNews()')

      return {
        success: false,
        error: JSON.stringify(err.response.data),
      }
    }
  }
}
