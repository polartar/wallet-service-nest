import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
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
import { EEnvironment } from '../environments/environment.types'
import { ConfigService } from '@nestjs/config'
import { EPeriod, EPortfolioType } from '@rana/core'
import { JwtService } from '@nestjs/jwt'
import * as Sentry from '@sentry/node'

@Injectable()
export class PortfolioService {
  clients: ISockets
  TRANSACTION_CREATION_CHANNEL = 'transaction_created'
  NFT_UPDATE_CHANNEL = 'nft_updated'
  rickApiUrl: string

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private jwtService: JwtService,
  ) {
    this.clients = {}
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
  }

  async getAccountIdFromAccessToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      })
      return payload.userId
    } catch (err) {
      Sentry.captureException('Unauthorize')

      throw new UnauthorizedException()
    }
  }

  async getWalletHistory(
    accountId: string,
    periods: EPeriod[],
  ): Promise<IWalletHistoryResponse> {
    if (!periods) periods = [EPeriod.All]
    let res
    try {
      res = await Promise.all(
        periods.map((period) =>
          firstValueFrom(
            this.httpService.get(
              `${this.rickApiUrl}/wallet/${accountId}?period=${period}`,
            ),
          ),
        ),
      )
    } catch (err) {
      Sentry.captureException(err.message + ' in getWalletHistory')

      return {
        success: false,
        error: err.message,
      }
    }

    if (!res)
      return {
        success: false,
      }

    const result = periods.map((period, index) => {
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

  notifyTransactionCreation(
    accountId: string,
    updatedAddresses: IUpdatedAddress[],
  ) {
    if (this.clients[accountId]) {
      this.clients[accountId].emit(
        this.TRANSACTION_CREATION_CHANNEL,
        JSON.stringify(updatedAddresses),
      )
    }
  }

  notifyNFTUpdate(accountId: string, updatedAddresses: IUpdatedAddress[]) {
    if (this.clients[accountId]) {
      this.clients[accountId].emit(
        this.NFT_UPDATE_CHANNEL,
        JSON.stringify(updatedAddresses),
      )
    }
  }

  handleUpdatedAddresses(type: EPortfolioType, addresses: IUpdatedAddress[]) {
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

    if (type === EPortfolioType.TRANSACTION) {
      Object.keys(history).map((accountId) => {
        this.notifyTransactionCreation(accountId, history[accountId])
      })
    } else {
      Object.keys(history).map((accountId) => {
        this.notifyNFTUpdate(accountId, history[accountId])
      })
    }
  }

  getAccount(accountId: number): Observable<AxiosResponse> {
    return this.httpService
      .get<AxiosResponse>(`${this.rickApiUrl}/account/${accountId}`)
      .pipe(
        catchError((error: AxiosError) => {
          Sentry.captureException(`getAccount(): ${error.message}`)

          throw 'An error happened: ' + error.message
        }),
      )
  }

  async getNFTAssets(address: string, pageNumber: number) {
    const page = pageNumber || 1

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.rickApiUrl}/nft?address=${address}&page=${page}`,
        ),
      )

      return response.data
    } catch (err) {
      Sentry.captureException(`getNFTAssets(): ${err.message}`)

      throw new BadRequestException(`Rick API call: ${err.message}`)
    }
  }
}
