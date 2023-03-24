import { ConfigService } from '@nestjs/config'
import { Injectable, Logger } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { HttpService } from '@nestjs/axios'
import { Server } from 'socket.io'
import { EPeriod, ECoinType } from '@rana/core'
import { EEnvironment } from '../environments/environment.types'

@Injectable()
export class MarketService {
  server: Server
  mortyApiUrl: string
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.mortyApiUrl = this.configService.get<string>(EEnvironment.mortyAPIUrl)
  }

  async getMarketData(coin: ECoinType) {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(
          `${this.mortyApiUrl}/api/market/${coin}`,
        ),
      )
      return res.data
    } catch (err) {
      Logger.log(err)
    }
  }
  async getHistoricalData(coin: ECoinType, period: EPeriod) {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(
          `${this.mortyApiUrl}/api/market/${coin}/history?period=${period}`,
        ),
      )
      return res.data
    } catch (err) {
      Logger.log(err)
    }
  }
  setEthPrice(price: string) {
    if (this.server) {
      this.server.emit('ethereum_price', price)
    }
  }
  setBtcPrice(price: string) {
    if (this.server) {
      this.server.emit('bitcoin_price', price)
    }
  }
}
