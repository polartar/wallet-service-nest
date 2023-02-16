import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse, AxiosError } from 'axios'
import { BigNumber } from 'ethers'

import { Observable, catchError, firstValueFrom } from 'rxjs'
import {
  IBalanceHistory,
  ISockets,
  IUpdatedHistory,
  IWallet,
} from './portfolio.types'
import { Socket } from 'socket.io'
import { IRickGetPortfolioHistory } from '../gateways/rick.types'
import { max } from 'class-validator'

@Injectable()
export class PortfolioService {
  clients: ISockets
  PORTFOLIO_UPDATE_CHANNEL = 'portfolio_update'
  RICK_API_URL = 'http://localhost:3333'

  constructor(private readonly httpService: HttpService) {
    this.clients = {}
  }

  async getWalletHistory(data: IRickGetPortfolioHistory) {
    const res = await Promise.all(
      data.periods.map((period) =>
        firstValueFrom(
          this.httpService.get(
            `${this.RICK_API_URL}/wallet/${data.accountId}?period=${period}`,
          ),
        ),
      ),
    )
    if (!data.periods) console.log(data)
    return data.periods.map((period, index) => {
      const history = res[index].data[0].history
      let max = BigNumber.from(history[0].balance),
        maxIndex = 0,
        min = BigNumber.from(history[0].balance),
        minIndex = 0
      history.forEach((spot, index) => {
        const balance = BigNumber.from(spot.balance)
        if (max.lt(balance)) {
          max = balance
          maxIndex = index
        }
        if (min.gt(balance)) {
          min = balance
          minIndex = index
        }
      })
      return {
        period: period,
        spots: history,
        stats: {
          max: max.toString(),
          maxLocation: maxIndex / (history.length - 1),
          min: min.toString(),
          minLocation: minIndex / (history.length - 1),
        },
      }
    })
  }

  addClient(accountId: number, client: Socket) {
    if (!this.clients[accountId]) {
      this.clients[accountId] = client
    }
  }

  removeClient(clientId: string) {
    Object.keys(this.clients).map((accountId) => {
      if (this.clients[accountId].id === clientId) {
        delete this.clients[accountId]
      }
    })
  }

  sendUpdatedHistory(accountId: string, history: IWallet[]) {
    if (this.clients[accountId]) {
      this.clients[accountId].emit(
        this.PORTFOLIO_UPDATE_CHANNEL,
        JSON.stringify(history),
      )
    }
  }

  updateWallets(wallets: IWallet[]) {
    const history: IUpdatedHistory = {}

    wallets.map((wallet) => {
      const accountId = wallet.account.id
      if (history[accountId]) {
        history[accountId].push(wallet)
      } else {
        history[accountId] = [wallet]
      }
    })

    Object.keys(history).map((accountId) => {
      this.sendUpdatedHistory(accountId, history[accountId])
    })
  }

  getAccount(accountId: number): Observable<AxiosResponse> {
    return this.httpService
      .get<AxiosResponse>(`${this.RICK_API_URL}/account/${accountId}`)
      .pipe(
        catchError((error: AxiosError) => {
          throw 'An error happened!' + error.message
        }),
      )
  }

  // createAccount(data: IAccount): Observable<AxiosResponse> {
  //   return this.httpService
  //     .post<AxiosResponse>(`${this.RICK_API_URL}/account`, { ...data })
  //     .pipe(
  //       catchError((error: AxiosError) => {
  //         throw 'An error happened!' + error.message
  //       }),
  //     )
  // }

  // addWallet(address: string, accountId: number): Observable<AxiosResponse> {
  //   return this.httpService
  //     .post<AxiosResponse>(`${this.RICK_API_URL}/wallet/${address}`, {
  //       account_id: accountId,
  //     })
  //     .pipe(
  //       catchError((error: AxiosError) => {
  //         throw 'An error happened!' + error.message
  //       }),
  //     )
  // }
}
