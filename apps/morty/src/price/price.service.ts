import { ICoinType } from './price.type'
import { Injectable } from '@nestjs/common'
import { Socket, io } from 'socket.io-client'
import * as WebSocket from 'ws'

@Injectable()
export class PriceService {
  COINCAP_SOCKET_URL = 'wss://ws.coincap.io/prices'
  private ethClient
  private btcClient
  constructor() {
    this.subscribeETHPrice()
    this.subscribeBTCPrice()
  }

  private ethConnect() {
    this.ethClient = new WebSocket(`${this.COINCAP_SOCKET_URL}?assets=ethereum`)
  }

  private btcConnect() {
    this.btcClient = new WebSocket(`${this.COINCAP_SOCKET_URL}?assets=bitcoin`)
  }

  subscribeETHPrice() {
    if (!this.ethClient) {
      this.ethConnect()
    }

    this.ethClient.on('message', function (response) {
      const ethPrice = JSON.parse(response)['ethereum']
      console.log('ETH price', ethPrice)
    })

    // console.log('Eth Subscribing')
    // this.ethClient.addEventListener('message', function (event) {
    //   console.log({ event })
    //   // parse & show the data
    // })
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

  getMarketData(coin: ICoinType) {}
}
