import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { ICoinType, IDuration } from './market.type'
import { Injectable, Logger } from '@nestjs/common'
// import { Socket, io } from 'socket.io-client'
import * as WebSocket from 'ws'
import { ConfigService } from '@nestjs/config'
import * as CoinMarketCap from 'coinmarketcap-api'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError, AxiosResponse } from 'axios'
import { BTCMarketData, ETHMarketData } from './MarketData'
@Injectable()
export class MarketService {
  COINMARKETCAP_RUL =
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?limit=2'
  private ethClient = null
  private btcClient
  private coinMarketClient
  ethIntervalInstance
  coinMarketAPI
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.coinMarketAPI = this.configService.get<string>(
      EEnvironment.coinMarketAPI,
    )

    this.coinMarketClient = new CoinMarketCap(this.coinMarketAPI)
    this.subscribeETHPrice()
    this.subscribeBTCPrice()
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

  async getMarketData(coin: ICoinType) {
    // const startDate = new Date(this.getDurationTime(duration))
    // const interval = this.getInterval(this.getDurationTime(duration))

    // // const apiURL = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?&vs_currency=USD&days=${days}`
    const apiURL =
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest'
    const res = await firstValueFrom(
      this.httpService.get<AxiosResponse>(apiURL, {
        params: {
          symbol: coin === ICoinType.BITCOIN ? 'BTC' : 'ETH',
        },
        headers: {
          'X-CMC_PRO_API_KEY': this.coinMarketAPI,
          Accept: 'application/json',
          'Accept-Encoding': 'deflate, gzip',
        },
      }),
    ).catch((err) => {
      Logger.log(`Coinmarket cap API error: ${err.message}`)
    })
    if (res) return res?.data

    if (coin === ICoinType.BITCOIN) {
      return ETHMarketData.data.quotes
    } else {
      return BTCMarketData.data.quotes
    }
  }

  getDurationTime(duration: IDuration) {
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

  getInterval(timestamp: number) {
    const days = timestamp / 1000 / 3600 / 24
    if (days <= 1) {
      return 'hourly'
    } else if (days < 180) {
      return 'daily'
    } else {
      return 'weekly'
    }
  }

  async getHistoricalData(coin: ICoinType, duration: IDuration) {
    // const startDate = new Date(this.getDurationTime(duration))
    // const interval = this.getInterval(this.getDurationTime(duration))
    // const apiURL = `SherkLock URL`
    // const res = await firstValueFrom(
    //   this.httpService.get<AxiosResponse>(apiURL),
    // )
    return [
      {
        exchange: 'Summary',
        periodStart: '2020-04-01T00:00:00.000Z',
        periodEnd: '2020-04-01T01:00:00.000Z',
        priceOpen: 6426.271239028723,
        priceClose: 6317.290024984293,
        priceLow: 6262.16210547219,
        priceHigh: 6438.996970932659,
        volumeQuote: 59092334.63107169,
        vwap: 6323.496062828807,
      },
      {
        exchange: 'Summary',
        periodStart: '2020-04-01T01:00:00.000Z',
        periodEnd: '2020-04-01T02:00:00.000Z',
        priceOpen: 6314.628076256183,
        priceClose: 6297.936546603603,
        priceLow: 6292.639006713064,
        priceHigh: 6333.610554360037,
        volumeQuote: 14708488.699215978,
        vwap: 6308.03756250981,
      },
    ]
  }
}
