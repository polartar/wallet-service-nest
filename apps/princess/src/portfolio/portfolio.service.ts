import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse, AxiosError } from 'axios'
import { BigNumber } from 'ethers'

import { Observable, catchError, firstValueFrom } from 'rxjs'
import {
  ISockets,
  IUpdatedAddress,
  IUpdatedHistory,
  IWalletHistoryResponse,
} from './portfolio.types'
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

  async getWalletHistory(
    data: IRickGetPortfolioHistory,
  ): Promise<IWalletHistoryResponse> {
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
      return {
        success: false,
        error: err.message,
      }
    }

    if (!res)
      return {
        success: false,
      }

    const result = data.periods.map((period, index) => {
      const wallets = res[index].data.map((wallet) => {
        const addresses = wallet.addresses.map((address) => {
          const history = address.history
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
            address: address.address,
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
          ...wallet,
          addresses: addresses,
        }
      })
      return {
        period,
        wallets,
      }
    })
    return {
      success: true,
      data: result,
    }
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

  sendUpdatedHistory(accountId: string, updatedAddresses: IUpdatedAddress[]) {
    if (this.clients[accountId]) {
      this.clients[accountId].emit(
        this.PORTFOLIO_UPDATE_CHANNEL,
        JSON.stringify(updatedAddresses),
      )
    }
  }

  updatedAddresses(addresses: IUpdatedAddress[]) {
    const history: IUpdatedHistory = {}

    addresses.map((address) => {
      address.accountIds.forEach((accountId) => {
        if (history[accountId]) {
          history[accountId].push(address)
        } else {
          history[accountId] = [address]
        }
      })
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
