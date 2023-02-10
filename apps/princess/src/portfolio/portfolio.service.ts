import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse, AxiosError } from 'axios'

import { Observable, catchError } from 'rxjs'
import { ISockets, IUpdatedHistory, IWallet } from './portfolio.types'
import { Socket } from 'socket.io'

@Injectable()
export class PortfolioService {
  clients: ISockets
  PORTFOLIO_UPDATE_CHANNEL = 'portfolio_update'

  constructor(private readonly httpService: HttpService) {
    this.clients = {}
  }
  getWalletHistory(accountId: number): Observable<AxiosResponse> {
    return this.httpService
      .get<AxiosResponse>(`http://localhost:3334/api/portfolio/${accountId}`)
      .pipe(
        catchError((error: AxiosError) => {
          throw 'An error happened!' + error.message
        }),
      )
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
}
