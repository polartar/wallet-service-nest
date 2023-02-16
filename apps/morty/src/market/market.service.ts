import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { IDuration } from './market.type'
import { Injectable, Logger } from '@nestjs/common'
// import { Socket, io } from 'socket.io-client'
import * as WebSocket from 'ws'
import { ConfigService } from '@nestjs/config'
import * as CoinMarketCap from 'coinmarketcap-api'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'

@Injectable()
export class MarketService {
  COINMARKETCAP_RUL =
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?limit=2'
  private ethClient
  private btcClient
  private coinMarketClient
  ethIntervalInstance
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    const coinMarketAPI = this.configService.get<string>(
      EEnvironment.coinMarketAPI,
    )

    this.coinMarketClient = new CoinMarketCap(coinMarketAPI)

    this.subscribeETHPrice()
    this.subscribeBTCPrice()
    // this.getMarketData()
  }

  private ethConnect() {
    try {
      this.ethClient = new WebSocket(
        `wss://ws.coincap.io/prices?assets=ethereum`,
      )
    } catch (err) {
      console.log(err)
    }
  }

  private btcConnect() {
    this.btcClient = new WebSocket(`wss://ws.coincap.io/prices?assets=bitcoin`)
  }

  subscribeETHPrice() {
    if (!this.ethClient) {
      this.ethConnect()
    }

    this.ethClient.on('message', (response) => {
      const res = JSON.parse(response)
      // try {
      firstValueFrom(
        this.httpService.post(`http://localhost:3000/market/ethereum`, res),
      ).catch(() => {
        Logger.log('Princess market/ethereum api error')
      })
    })

    this.ethClient.on('close', () => {
      this.ethIntervalInstance = setInterval(() => this.ethConnect(), 1000)
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

  getSnapshotDate(duration: IDuration) {
    const snapshotDate = new Date()
    switch (duration) {
      case IDuration.DAY:
        snapshotDate.setDate(snapshotDate.getDate() - 1)
        break
      case IDuration.MONTH:
        snapshotDate.setDate(snapshotDate.getMonth() - 1)
        break
      case IDuration.MONTHS:
        snapshotDate.setDate(snapshotDate.getMonth() - 6)
        break
      case IDuration.YEAR:
        snapshotDate.setDate(snapshotDate.getFullYear() - 1)
        break
    }
    return snapshotDate.toISOString()
  }

  async getMarketData(duration?: IDuration) {
    return await this.coinMarketClient.getQuotes({
      symbol: [
        'BTC', //
        'ETH',
      ],
      date: this.getSnapshotDate(duration),
    })
  }
}
