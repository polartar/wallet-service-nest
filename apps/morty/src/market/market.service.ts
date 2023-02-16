import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { IDuration } from './market.type'
import { Injectable, Logger } from '@nestjs/common'
// import { Socket, io } from 'socket.io-client'
import * as WebSocket from 'ws'
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
    // setInterval(() => this.keepAlive(this.ethClient), 5000)
    // this.keepAlive(this.ethClient)
  }

  private ethConnect() {
    this.ethClient = new WebSocket(`wss://ws.coincap.io/prices?assets=ethereum`)
  }

  private btcConnect() {
    this.btcClient = new WebSocket(`wss://ws.coincap.io/prices?assets=bitcoin`)
  }

  keepAlive = function (client) {
    Logger.log('alive', client.readyState)
    if (client.readyState === client.OPEN) {
      client.send('ping')
    }

    setTimeout(() => this.keepAlive(client), 50000)
  }

  subscribeETHPrice() {
    if (!this.ethClient) {
      this.ethConnect()
    }

    this.ethClient.on('message', function (response) {
      const ethPrice = JSON.parse(response)['ethereum']
      Logger.log('ETH price', ethPrice)
    })

    this.ethClient.on('close', function () {
      Logger.log('closed')
    })
    this.ethClient.on('error', function (e) {
      Logger.log('error', e)
    })
  }
  subscribeBTCPrice() {
    if (!this.btcClient) {
      this.btcConnect()
    }
    this.btcClient.on('message', function (response) {
      const btcPrice = JSON.parse(response)['bitcoin']
      Logger.log('BTC price', btcPrice)
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
