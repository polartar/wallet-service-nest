import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { IResponse } from './market.type'
import { Injectable } from '@nestjs/common'
import * as WebSocket from 'ws'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { EPeriod, ECoinType, getTimestamp } from '@rana/core'
import * as Sentry from '@sentry/node'

@Injectable()
export class MarketService {
  private ethClient = null
  private btcClient
  coinMarketAPI: string
  private fidelityAccessToken: string
  private fidelityClientId: string
  private fidelityClientSecret: string
  private expiredAt: number
  private retryInterval = 10 * 1000 // retry to connect socket time, 10s
  princessAPIUrl: string
  private marketApiUrl =
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'
  private historyApiUrl = `https://api-live.fidelity.com/crypto-asset-analytics/v1/crypto/analytics/market/spot`

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.coinMarketAPI = this.configService.get<string>(
      EEnvironment.coinMarketAPI,
    )
    this.fidelityClientId = this.configService.get<string>(
      EEnvironment.fidelityClientId,
    )
    this.fidelityClientSecret = this.configService.get<string>(
      EEnvironment.fidelityClientSecret,
    )
    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )

    this.subscribeETHPrice()
    this.subscribeBTCPrice()
  }

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
      this.expiredAt = new Date().getTime() + 3599 * 1000

      this.fidelityAccessToken = response.data.access_token
    } catch (err) {
      Sentry.captureException(`getAuthToken(): ${err.message}`)
    }
  }

  private ethConnect() {
    this.ethClient = new WebSocket(`wss://ws.coincap.io/prices?assets=ethereum`)

    this.ethClient.on('error', () => {
      Sentry.captureException('Eth client reconnecting!')

      this.ethClose()
      //retry to connect after 10s
      setTimeout(() => this.ethConnect(), this.retryInterval)
    })
  }

  private btcConnect() {
    this.btcClient = new WebSocket(`wss://ws.coincap.io/prices?assets=bitcoin`)

    this.btcClient.on('error', () => {
      Sentry.captureException('Btc client reconnecting!')
      this.btcClose()
      //retry to connect after 10s
      setTimeout(() => this.btcConnect(), this.retryInterval)
    })
  }

  subscribeETHPrice() {
    if (!this.ethClient) {
      this.ethConnect()
    }

    this.ethClient.on('message', (response) => {
      const res = JSON.parse(response)

      firstValueFrom(
        this.httpService.post(`${this.princessAPIUrl}/market/price/eth`, res),
      ).catch((err) => {
        Sentry.captureException(`subscribeETHPrice(): ${err.message}`)
      })
    })
  }
  subscribeBTCPrice() {
    if (!this.btcClient) {
      this.btcConnect()
    }

    this.btcClient.on('message', (response) => {
      const res = JSON.parse(response)
      firstValueFrom(
        this.httpService.post(`${this.princessAPIUrl}/market/price/btc`, res),
      ).catch((err) => {
        Sentry.captureException(`subscribeBTCPrice(): ${err.message}`)
      })
    })
  }

  ethClose() {
    this.ethClient.close()
  }

  btcClose() {
    this.btcClient.close()
  }

  async getMarketData(coin: ECoinType): Promise<IResponse> {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(this.marketApiUrl, {
          params: {
            limit: 2,
          },
          headers: {
            'X-CMC_PRO_API_KEY': this.coinMarketAPI,
            Accept: 'application/json',
            'Accept-Encoding': 'deflate, gzip',
          },
        }),
      )

      if (coin === ECoinType.BITCOIN) {
        return {
          success: true,
          data: {
            ...res.data.data[0]['quote']['USD'],
            total_supply: res.data.data[0].total_supply,
            last_updated: getTimestamp(
              res.data.data[0]['quote']['USD']['last_updated'],
            ),
          },
        }
      } else {
        return {
          success: true,
          data: {
            ...res.data.data[1]['quote']['USD'],
            total_supply: res.data.data[1].total_supply,
            last_updated: getTimestamp(
              res.data.data[1]['quote']['USD']['last_updated'],
            ),
          },
        }
      }
    } catch (err) {
      Sentry.captureException(
        `getMarketData(): ${err.response.data.status.error_message}`,
      )
      return {
        success: false,
        error: err.response.data.status.error_message,
      }
    }
  }

  getPeriodTime(period: EPeriod): number {
    const day = 3600 * 24 * 1000
    const now = Date.now()
    let newTimestamp

    if (period === EPeriod.Day) {
      newTimestamp = now - day
    } else if (period === EPeriod.Week) {
      newTimestamp = now - day * 7
    } else if (period === EPeriod.Month) {
      newTimestamp = now - day * 30
    } else if (period === EPeriod.Months) {
      newTimestamp = now - day * 180
    } else if (period === EPeriod.Year) {
      newTimestamp = now - day * 365
    } else {
      newTimestamp = now - day * 365 * 100
    }
    return newTimestamp
  }

  getTimeFrame(period: EPeriod) {
    if (
      period === EPeriod.Day ||
      period === EPeriod.Week ||
      period === EPeriod.Month
    ) {
      return '1HR'
    } else {
      return '1DAY'
    }
  }

  async getHistoricalData(
    coin: ECoinType,
    period: EPeriod,
  ): Promise<IResponse> {
    const startDate = new Date(this.getPeriodTime(period))
    const timeFrame = this.getTimeFrame(period)

    const apiURL = `${this.historyApiUrl}/${coin}/price?startTime=${startDate}&timeFrame=${timeFrame}`

    try {
      if (!this.expiredAt || new Date().getTime() >= this.expiredAt) {
        await this.getAuthToken()
      }

      const res = await firstValueFrom(
        this.httpService.get(apiURL, {
          headers: { Authorization: `Bearer ${this.fidelityAccessToken}` },
        }),
      )

      return {
        success: true,
        data: res.data.map(
          (item: { periodStart: string; periodEnd: string }) => ({
            ...item,
            periodStart: getTimestamp(item.periodStart),
            periodEnd: getTimestamp(item.periodEnd),
          }),
        ),
      }
    } catch (err) {
      Sentry.captureException(`getHistoricalData: ${err.message}`)

      return {
        success: false,
        error: JSON.stringify(err.response.data),
      }
    }
  }
}
