import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse, AxiosError } from 'axios'
import { BigNumber } from 'ethers'

import { Observable, catchError, firstValueFrom } from 'rxjs'
import { ISockets, IUpdatedHistory, IWallet } from './portfolio.types'
import { Socket } from 'socket.io'
import { IRickGetPortfolioHistory } from '../gateways/rick.types'
import { EEnvironment } from '../environments/environment.types'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class PortfolioService {
  clients: ISockets
  PORTFOLIO_UPDATE_CHANNEL = 'portfolio_update'
  rickApiUrl: string

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.clients = {}
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
  }

  async getWalletHistory(data: IRickGetPortfolioHistory) {
    if (!data.periods) data.periods = ['All']
    let res
    try {
      res = await Promise.all(
        data.periods.map((period) =>
          firstValueFrom(
            this.httpService.get(
              `${this.rickApiUrl}/wallet/${data.accountId}?period=${period}`,
            ),
          ),
        ),
      )
    } catch (err) {
      Logger.error(err.message)
    }

    if (!res)
      return {
        status: false,
      }

    if (res[0].data.length === 0) {
      return []
    }
    return data.periods.map((period, index) => {
      const walletsHistory = res[index].data.map((wallet) => {
        const history = wallet.history
        if (history.length === 0) {
          return {
            status: true,
            period: period,
            spots: history,
            stats: {
              max: undefined,
              maxLocation: undefined,
              min: undefined,
              minLocation: undefined,
            },
          }
        }
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
          address: wallet.address,
          type: wallet.type,
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
      return {
        period,
        walletsHistory,
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
      .get<AxiosResponse>(`${this.rickApiUrl}/account/${accountId}`)
      .pipe(
        catchError((error: AxiosError) => {
          throw 'An error happened!' + error.message
        }),
      )
  }
}
