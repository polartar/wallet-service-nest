import { Injectable } from '@nestjs/common'
import { ICoinType } from './market.types'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { HttpService } from '@nestjs/axios'
import { Server } from 'socket.io'
import { EPeriod } from '@rana/core'

@Injectable()
export class MarketService {
  server: Server
  constructor(private readonly httpService: HttpService) {}

  async getMarketData(coin: ICoinType, period: EPeriod) {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(
          `http://localhost:3333/api/market/${coin}/${period}`,
        ),
      )
      return res.data
    } catch (err) {
      console.log(err)
    }
  }
  async getHistoricalData(coin: ICoinType, period: EPeriod) {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(
          `http://localhost:3333/api/market/${coin}/historical?period=${period}`,
        ),
      )
      return res.data
    } catch (err) {
      console.log(err)
    }
  }
  setEthPrice(price: string) {
    console.log({ price })
    // this.server.emit('ethereum_price', price)
  }
  setBtcPrice(price: string) {
    // this.server.emit('bitcoin_price', price)
  }
}
