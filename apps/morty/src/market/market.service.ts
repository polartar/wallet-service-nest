import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { ICoinType, IDuration, IResponse } from './market.type'
import { Injectable, Logger } from '@nestjs/common'
import * as WebSocket from 'ws'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'

@Injectable()
export class MarketService {
  private ethClient = null
  private btcClient
  coinMarketAPI
  private fidelityAccessToken: string
  private fidelityClientId: string
  private fidelityClientSecret: string
  private expiredAt: number

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

    this.subscribeETHPrice()
    this.subscribeBTCPrice()
    this.getAuthToken()
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
      setTimeout(() => this.ethConnect(), 10000)
    })
  }

  private btcConnect() {
    this.btcClient = new WebSocket(`wss://ws.coincap.io/prices?assets=bitcoin`)
    this.btcClient.on('error', () => {
      Logger.log('Btc client reconnecting!')
      this.btcClose()
      setTimeout(() => this.btcConnect(), 10000)
    })
  }

  subscribeETHPrice() {
    if (!this.ethClient) {
      this.ethConnect()
    }

    this.ethClient.on('message', (response) => {
      const res = JSON.parse(response)
      firstValueFrom(
        this.httpService.post(`http://localhost:3000/market/ethereum`, res),
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
        this.httpService.post(`http://localhost:3000/market/bitcoin`, res),
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

  getDays(duration: IDuration) {
    switch (duration) {
      case IDuration.DAY:
        return 1
      case IDuration.WEEK:
        return 7
      case IDuration.MONTH:
        return 30
      case IDuration.MONTHS:
        return 180
      case IDuration.YEAR:
        return 365
    }
    return 1
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

  getDurationTime(duration: IDuration): Date {
    const day = 3600 * 24 * 1000
    const now = Date.now()
    let newTimestamp
    if (duration === IDuration.DAY) {
      newTimestamp = now - day
    } else if (duration === IDuration.WEEK) {
      newTimestamp = now - day * 7
    } else if (duration === IDuration.MONTH) {
      newTimestamp = now - day * 30
    } else if (duration === IDuration.MONTHS) {
      newTimestamp = now - day * 180
    } else if (duration === IDuration.YEAR) {
      newTimestamp = now - day * 365
    } else {
      newTimestamp = now - day * 365 * 100
    }
    return newTimestamp
  }

  getInterval(duration: IDuration) {
    if (duration === IDuration.DAY || duration === IDuration.MONTH) {
      return '1HR'
    } else {
      return '1DAY'
    }
  }

  async getHistoricalData(
    coin: ICoinType,
    duration: IDuration,
  ): Promise<IResponse> {
    const startDate = new Date(this.getDurationTime(duration))
    const interval = this.getInterval(duration)

    const apiURL = `https://api-live.fidelity.com/crypto-asset-analytics/v1/crypto/analytics/market/spot/${
      coin === ICoinType.BITCOIN ? 'btc' : 'eth'
    }/price?startTime=${startDate}&timeFrame=${interval}`
    try {
      if (new Date().getTime() >= this.expiredAt) {
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
