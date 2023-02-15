import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { ICoinType, IDuration } from './market.type'
import { Injectable } from '@nestjs/common'
import { Socket, io } from 'socket.io-client'
import * as WebSocket from 'ws'
import { Observable, catchError, firstValueFrom } from 'rxjs'
import { AxiosError, AxiosResponse } from 'axios'
import { ConfigService } from '@nestjs/config'
import * as CoinMarketCap from 'coinmarketcap-api'

@Injectable()
export class MarketService {
  COINMARKETCAP_RUL =
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/historical?limit=2'
  private ethClient
  private btcClient
  private coinMarketClient
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
    this.getMarketData()
  }

  private ethConnect() {
    this.ethClient = new WebSocket(`wss://ws.coincap.io/prices?assets=ethereum`)
  }

  private btcConnect() {
    this.btcClient = new WebSocket(`wss://ws.coincap.io/prices?assets=bitcoin`)
  }

  subscribeETHPrice() {
    if (!this.ethClient) {
      this.ethConnect()
    }

    this.ethClient.on('message', function (response) {
      const ethPrice = JSON.parse(response)['ethereum']
      console.log('ETH price', ethPrice)
    })
  }
  subscribeBTCPrice() {
    if (!this.btcClient) {
      this.btcConnect()
    }
    this.btcClient.on('message', function (response) {
      const btcPrice = JSON.parse(response)['bitcoin']
      console.log('BTC price', btcPrice)
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
