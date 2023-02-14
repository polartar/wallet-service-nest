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
import { IRickGetPortfolioHistory } from '../gateways/rick.types'

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
            `${this.RICK_API_URL}/wallet/${
              data.accountId
            }?period=${period.toLowerCase()}`,
          ),
        ),
      ),
    )
    return data.periods.map((period, index) => ({
      period,
      spots: res[index],
    }))
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
