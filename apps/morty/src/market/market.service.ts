import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { IResponse } from './market.type'
import { Injectable, Logger } from '@nestjs/common'
import * as WebSocket from 'ws'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { EPeriod, ICoinType } from '@rana/core'

@Injectable()
export class MarketService {
  private ethClient = null
  private btcClient
  coinMarketAPI: string
  private fidelityAccessToken: string
  private fidelityClientId: string
  private fidelityClientSecret: string
  private expiredAt: number
  private retryInterval = 10 * 1000 // retry to connect socket time
  princessAPIUrl: string

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
      Logger.error(err.message)
    }
  }

  private ethConnect() {
    this.ethClient = new WebSocket(`wss://ws.coincap.io/prices?assets=ethereum`)

    this.ethClient.on('error', () => {
      Logger.log('Eth client reconnecting!')

      this.ethClose()
      //retry to connect after 10s
      setTimeout(() => this.ethConnect(), this.retryInterval)
    })
  }

  private btcConnect() {
    this.btcClient = new WebSocket(`wss://ws.coincap.io/prices?assets=bitcoin`)

    this.btcClient.on('error', () => {
      Logger.log('Btc client reconnecting!')
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
        this.httpService.post(`${this.princessAPIUrl}/market/ethereum`, res),
      ).catch(() => {
        Logger.log('Princess market/ethereum api error')
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
        this.httpService.post(`${this.princessAPIUrl}/market/bitcoin`, res),
      ).catch(() => {
        Logger.log('Princess market/bitcoin api error')
      })
    })
  }

  ethClose() {
    this.ethClient.close()
  }

  btcClose() {
    this.btcClient.close()
  }

  async getMarketData(coin: ICoinType): Promise<IResponse> {
    const apiURL =
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'

    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(apiURL, {
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

      if (coin === ICoinType.BITCOIN) {
        return { success: true, data: res.data.data[0]['quote']['USD'] }
      } else {
        return { success: true, data: res.data.data[1]['quote']['USD'] }
      }
    } catch (err) {
      return {
        success: false,
        error: err.response.data.status.error_message,
      }
    }
  }

  getPeriodTime(period: EPeriod): Date {
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

  getInterval(period: EPeriod) {
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
    coin: ICoinType,
    period: EPeriod,
  ): Promise<IResponse> {
    const startDate = new Date(this.getPeriodTime(period))
    const interval = this.getInterval(period)

    const apiURL = `https://api-live.fidelity.com/crypto-asset-analytics/v1/crypto/analytics/market/spot/${coin}/price?startTime=${startDate}&timeFrame=${interval}`

    try {
      if (!this.expiredAt || new Date().getTime() >= this.expiredAt) {
        await this.getAuthToken()
      }

      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(apiURL, {
          headers: { Authorization: `Bearer ${this.fidelityAccessToken}` },
        }),
      )

      return {
        success: true,
        data: res.data,
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
