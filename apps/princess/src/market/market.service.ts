import { Injectable } from '@nestjs/common'
import { IDuration } from './market.types'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { HttpService } from '@nestjs/axios'

@Injectable()
export class MarketService {
  constructor(private readonly httpService: HttpService) {}

  async getMarketData(duration: IDuration) {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(
          `http://localhost:3333/api/market/${duration}`,
        ),
      )
      return res.data
    } catch (err) {
      console.log(err)
    }
  }
  setEthPrice(price: string) {
    console.log('ETH', price)
  }
  setBtcPrice(price: string) {
    console.log('Bit', price)
  }
}
