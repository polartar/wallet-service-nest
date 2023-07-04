import { HttpService } from '@nestjs/axios'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { ESort, INewsQuery } from './news.types'
import { ECoinTypes, getTimestamp } from '@rana/core'
import * as Sentry from '@sentry/node'
import { NewsPaginationDto } from './dto/news-pagination.dto'

@Injectable()
export class NewsService {
  private fidelityAccessToken: string
  private fidelityClientId: string
  private fidelityClientSecret: string
  private expiredAt: number
  defaultCountPerPage = 10
  defaultTopCount = 3

  fidelityNewsApiUrl =
    'https://api-live.fidelity.com/crypto-asset-analytics/v1/crypto/analytics/news'
  fidelityAuthUrl =
    'https://api-live.fidelity.com/oauth/client_credential/accesstoken?grant_type=client_credentials'
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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await process.nextTick(() => {})
      const response = await firstValueFrom(
        this.httpService.post(this.fidelityAuthUrl, params, config),
      )

      this.expiredAt = new Date().getTime() + 3590 * 1000

      this.fidelityAccessToken = response.data.access_token
    } catch (err) {
      Sentry.captureException(`getAuthToken(): ${JSON.stringify(err)}`)
    }
  }

  generateParams(query: INewsQuery): string {
    const skip = (query['page-number'] - 1) * query['count-per-page']
    let params = `?limit=${query['count-per-page']}&skip=${skip}`

    if (query.sort === ESort.DESC) {
      params += '&sort=desc'
    } else {
      params += '&sort=asc'
    }
    if (query['start-time']) {
      params += `&startTime=${query['start-time']}`
    }
    if (query['end-time']) {
      params += `&endTime=${query['end-time']}`
    }
    if (query.coin) {
      params += `&symbols=${query.coin}`
    } else {
      params += `&symbols=${ECoinTypes.BITCOIN},${ECoinTypes.ETHEREUM}`
    }
    return params
  }

  async getNews(query: NewsPaginationDto) {
    const newQuery = query

    newQuery['page-number'] = query['page-number'] || 1
    newQuery['count-per-page'] =
      query['count-per-page'] || this.defaultCountPerPage

    const params = query.highlights
      ? `?limit=${query.highlights}`
      : this.generateParams(newQuery)

    const apiURL = `${this.fidelityNewsApiUrl}/${params}`
    try {
      if (!this.expiredAt || new Date().getTime() >= this.expiredAt) {
        await this.getAuthToken()
      }

      const res: { data: unknown } = await firstValueFrom(
        this.httpService.get<AxiosResponse>(apiURL, {
          headers: { Authorization: `Bearer ${this.fidelityAccessToken}` },
        }),
      )
      const news = (res.data as { news: [] }).news.map(
        (item: { pubDateUtc: string }) => ({
          pubDateUtc: getTimestamp(item.pubDateUtc),
          ...item,
        }),
      )

      if (query.highlights) {
        return news
      } else {
        return {
          news,
          total: (res.data as { total: number }).total,
          currentPage: newQuery['page-number'],
          countPerPage: newQuery['count-per-page'],
        }
      }
    } catch (err) {
      Sentry.captureException(`getNews(): ${JSON.stringify(err.response.data)}`)

      throw new InternalServerErrorException(err.message)
    }
  }
}
