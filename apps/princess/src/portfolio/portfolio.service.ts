import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse, AxiosError } from 'axios'

import { Observable, catchError, firstValueFrom } from 'rxjs'
import {
  IBalanceHistory,
  ISockets,
  IUpdatedHistory,
  IWallet,
} from './portfolio.types'
import { Socket } from 'socket.io'
import { IPortfolioDuration } from '../gateways/rick.types'

@Injectable()
export class PortfolioService {
  clients: ISockets
  periods: { [key: string]: IPortfolioDuration }
  PORTFOLIO_UPDATE_CHANNEL = 'portfolio_update'
  RICK_API_URL = 'http://localhost:3333'

  constructor(private readonly httpService: HttpService) {
    this.clients = {}
    this.periods = {}
  }

  getDurationTime(duration: IPortfolioDuration) {
    let durationTime = 1000 * 3600
    switch (duration) {
      case IPortfolioDuration.DAY:
        durationTime *= 24
        break
      case IPortfolioDuration.MONTH:
        durationTime *= 24 * 30
        break
      case IPortfolioDuration.MONTHs:
        durationTime *= 24 * 30 * 6
        break
      case IPortfolioDuration.YEAR:
        durationTime *= 24 * 365
        break
      case IPortfolioDuration.ALL:
      default:
        durationTime = null
    }
    return durationTime
  }

  filterHistory(accountId: number, history: IWallet[]) {
    const durationTime = this.getDurationTime(this.periods[accountId])

    if (!durationTime) {
      return history
    }
    const startTime = new Date().getTime() - durationTime
    // filter the balance history based on the duration
    const newHistory = history.map((wallet) => {
      const balanceHistory: IBalanceHistory[] = JSON.parse(
        wallet.balanceHistory,
      )
      if (balanceHistory && balanceHistory.length > 0) {
        const startIndex = balanceHistory.findIndex(
          (balance) => balance.date >= startTime,
        )
        const newBalanceHistory =
          startIndex === -1 ? [] : balanceHistory.slice(startIndex)
        return {
          ...wallet,
          balanceHistory: JSON.stringify(newBalanceHistory),
        }
      }
      return wallet
    })

    return newHistory
  }
  async getWalletHistory(accountId: number) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.RICK_API_URL}/wallet/${accountId}`),
    )

    return this.filterHistory(accountId, response.data as IWallet[])
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
      this.sendUpdatedHistory(
        accountId,
        this.filterHistory(Number(accountId), history[accountId]),
      )
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

  addPeriod(accountId: number, duration: IPortfolioDuration) {
    this.periods[accountId] = duration
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
