import { Injectable } from '@nestjs/common'
import { ICoinType, IDuration } from './market.types'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { HttpService } from '@nestjs/axios'
import { Server } from 'socket.io'

@Injectable()
export class MarketService {
  server: Server
  constructor(private readonly httpService: HttpService) {}

  async getMarketData(coin: ICoinType, duration: IDuration) {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(
          `http://localhost:3333/api/market/${coin}/${duration}`,
        ),
      )
      return res.data
    } catch (err) {
      console.log(err)
    }
  }
  async getHistoricalData(coin: ICoinType, duration: IDuration) {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(
          `http://localhost:3333/api/market/${coin}/historical?period=${duration}`,
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
