import { ConfigService } from '@nestjs/config'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { HttpService } from '@nestjs/axios'
import { Server } from 'socket.io'
import { EPeriod, ENetworks } from '@rana/core'
import { EEnvironment } from '../environments/environment.types'
import * as Sentry from '@sentry/node'

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

  async getMarketData(coin: ENetworks) {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(
          `${this.mortyApiUrl}/api/market/${coin}`,
        ),
      )
      return res.data
    } catch (err) {
      Sentry.captureException(err.message + 'in getMarketData()')

      throw new InternalServerErrorException('Morty API call error')
    }
  }

  async getHistoricalData(coin: ENetworks, period: EPeriod) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(
          `${this.mortyApiUrl}/api/market/${coin}/history?period=${period}`,
        ),
      )
      return res.data
    } catch (err) {
      Sentry.captureException(err.message + 'in getHistoricalData()')

      throw new InternalServerErrorException('Morty API call error')
    }
  }

  setEthPrice(price: string) {
    if (this.server) {
      try {
        this.server.emit('ethereum_price', price)
      } catch (err) {
        Sentry.captureException(`setEthPrice: ${err.message}`)
      }
    }
  }

  setBtcPrice(price: string) {
    if (this.server) {
      try {
        this.server.emit('bitcoin_price', price)
      } catch (err) {
        Sentry.captureException(`setBtcPrice: ${err.message}`)
      }
    }
  }
}
