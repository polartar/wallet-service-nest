import { ConfigService } from '@nestjs/config'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { HttpService } from '@nestjs/axios'
import { Server } from 'socket.io'
import { EPeriod, ECoinTypes } from '@rana/core'
import { EEnvironment } from '../environments/environment.types'
import * as Sentry from '@sentry/node'

@Injectable()
export class CoinService {
  server: Server
  rickApiURL: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.rickApiURL = this.configService.get<string>(EEnvironment.rickAPIUrl)
  }

  async getMarketData(coinType: ECoinTypes) {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(
          `${this.rickApiURL}/coin/${coinType}`,
        ),
      )
      return res.data
    } catch (err) {
      Sentry.captureException(err.message + 'in getMarketData()')

      throw new InternalServerErrorException('Rick API call error')
    }
  }

  async getHistoricalData(coinType: ECoinTypes, period: EPeriod) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(
          `${this.rickApiURL}/coin/${coinType}/history?period=${period}`,
        ),
      )
      return res.data
    } catch (err) {
      Sentry.captureException(err.message + 'in getHistoricalData()')

      throw new InternalServerErrorException('Rick API call error')
    }
  }

  setEthPrice(price: string) {
    if (this.server) {
      try {
        this.server.emit('ethereum_price', price)
      } catch (err) {
        // Sentry.captureException(`setEthPrice: ${err.message}`)
      }
    }
  }

  setBtcPrice(price: string) {
    if (this.server) {
      try {
        this.server.emit('bitcoin_price', price)
      } catch (err) {
        // Sentry.captureException(`setBtcPrice: ${err.message}`)
      }
    }
  }
}
