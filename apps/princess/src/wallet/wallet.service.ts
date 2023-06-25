import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Request,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EAuth, ENetworks, EPeriod, EWalletType } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { UpdateWalletDto } from './dto/UpdateWalletDto'
import { AxiosResponse } from 'axios'
import { EAPIMethod, IMarketData, ITransaction } from './wallet.types'
import * as Sentry from '@sentry/node'
import { MarketService } from '../market/market.service'
import { formatUnits, isAddress } from 'ethers/lib/utils'
import { REQUEST } from '@nestjs/core'
import { TransactionService } from '../transaction/transaction.service'
import { IRequest } from '../accounts/accounts.types'
import { CreateAccountDto } from '../accounts/dto/create-account.dto'
import { CreateWalletDto } from './dto/create-wallet.dto'

@Injectable()
export class WalletsService {
  rickApiUrl: string
  fluffyApiUrl: string
  gandalfApiUrl: string
  bristleApiUrl: string

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly marketService: MarketService,
    private readonly transactionService: TransactionService,
  ) {
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
    this.bristleApiUrl = this.configService.get<string>(
      EEnvironment.bristleAPIUrl,
    )
    this.gandalfApiUrl = this.configService.get<string>(
      EEnvironment.gandalfAPIUrl,
    )
    this.fluffyApiUrl = this.configService.get<string>(
      EEnvironment.fluffyAPIUrl,
    )
  }

  getAccountIdFromRequest(): number {
    return Number((this.request as IRequest).accountId)
  }

  getDeviceIdFromRequest(): string {
    return (this.request as IRequest).deviceId
  }

  validateAccountId(accountId: number) {
    if (Number(accountId) === this.getAccountIdFromRequest()) {
      return true
    } else {
      throw new BadRequestException('Wallet Id  not matched')
    }
  }

  async apiCall(
    method: EAPIMethod,
    apiUrl: string,
    path: string,
    body?: unknown,
  ) {
    try {
      const url = `${apiUrl}/${path}`
      const res = await firstValueFrom(
        method === EAPIMethod.POST
          ? this.httpService.post(url, body)
          : this.httpService.get(url),
      )
      return res.data
    } catch (err) {
      if (err.response) {
        Sentry.captureException(
          `${err.response.data.message}: ${apiUrl}/${path} API call`,
        )
        throw new BadRequestException(err.response.data.message)
      } else {
        Sentry.captureException(`${err.message}: ${apiUrl}/${path} API call`)
        throw new BadRequestException(err.message)
      }
    }
  }

  // async rickAPICall(method: EAPIMethod, path: string, body?: unknown) {
  //   try {
  //     const url = `${this.rickApiUrl}/${path}`
  //     const res = await firstValueFrom(
  //       method === EAPIMethod.POST
  //         ? this.httpService.post(url, body)
  //         : this.httpService.get(url),
  //     )
  //     return res.data
  //   } catch (err) {
  //     const message = err.response ? err.response.data.message : err.message
  //     Sentry.captureException(`rickAPICall(): ${message}`)

  //     if (err.response) {
  //       throw new InternalServerErrorException(message)
  //     }
  //     throw new BadGatewayException(`Rick server connection error: ${message}`)
  //   }
  // }

  async getWalletTransaction(walletId, start = 0, count = 50) {
    const accountId = this.getAccountIdFromRequest()
    const transactions: ITransaction[] = await this.apiCall(
      EAPIMethod.GET,
      this.rickApiUrl,
      `wallet/${accountId}/wallet/${walletId}/transactions?count=${count}&start=${start}`,
    )

    return this.addUSDPrice(transactions)
  }

  async getWallet(walletId) {
    const accountId = this.getAccountIdFromRequest()

    return await this.apiCall(
      EAPIMethod.GET,
      this.rickApiUrl,
      `wallet/${accountId}/wallet/${walletId}`,
    )
  }

  async getWalletPortfolio(walletId, period?: EPeriod) {
    const accountId = this.getAccountIdFromRequest()

    return await this.apiCall(
      EAPIMethod.GET,
      this.rickApiUrl,
      `wallet/${accountId}/wallet/${walletId}/portfolio?period=${period}`,
    )

    // return this.addUSDPrice(wallets, period)
  }

  async getWallets() {
    const accountId = this.getAccountIdFromRequest()

    return await this.apiCall(
      EAPIMethod.GET,
      this.rickApiUrl,
      `wallet/${accountId}`,
    )

    // return this.addUSDPrice(wallets, period)
  }

  async createWallet(data: CreateWalletDto) {
    const accountId = this.getAccountIdFromRequest()

    if (data.wallet_type !== EWalletType.VAULT) {
      if (data.assets && data.assets.length > 0) {
        return await this.apiCall(EAPIMethod.POST, this.rickApiUrl, `wallet`, {
          accountId,
          ...data,
        })
      } else {
        throw new BadRequestException('Invalid asset ids')
      }
    }

    // return this.addUSDPrice([wallet], EPeriod.Day)
  }

  async sync(title: string, parts: string[]) {
    const accountId = this.getAccountIdFromRequest()

    const decryption = await this.apiCall(
      EAPIMethod.POST,
      this.bristleApiUrl,
      'sync',
      { parts },
    )

    try {
      const addresses = await this.apiCall(
        EAPIMethod.POST,
        this.rickApiUrl,
        'wallet/xpubs',
        { title, accountId, xpubs: decryption.data },
      )
      return addresses
    } catch (err) {
      Sentry.captureException(`Sync(): ${err.message}`)

      throw new BadRequestException(`${err.message}`)
    }
  }

  // async createWallet(walletType: EWalletType, xPub: string) {
  //   const accountId = this.getAccountIdFromRequest()

  //   const wallet = await this.rickAPICall(EAPIMethod.POST, `wallet`, {
  //     account_id: accountId,
  //     wallet_type: walletType,
  //     xPub: xPub,
  //   })

  //   return this.addUSDPrice([wallet], EPeriod.Day)
  // }

  // async updateWallet(
  //   walletId: number,
  //   walletId: string,
  //   data: UpdateWalletDto,
  // ) {
  //   this.validateAccountId(walletId)

  //   return this.rickAPICall(EAPIMethod.POST, `wallet/activate`, {
  //     wallet_id: walletId,
  //     walletId: walletId,
  //     is_active: data.is_active,
  //   })
  // }

  getPrice(source: IMarketData[], timestamp: number) {
    const index = source.findIndex(
      (market) =>
        new Date(market.periodEnd).getTime() / 1000 >= +timestamp &&
        +timestamp >= new Date(market.periodStart).getTime() / 1000,
    )

    return index !== -1 ? source[index].vwap : source[source.length - 1].vwap
  }

  async addUSDPrice(transactions: ITransaction[]) {
    const ethMarketHistories = await this.marketService.getHistoricalData(
      ENetworks.ETHEREUM,
      EPeriod.All,
    )

    const btcMarketHistories = await this.marketService.getHistoricalData(
      ENetworks.BITCOIN,
      EPeriod.All,
    )
    // const ethFee = await this.transactionService.getFee(ENetworks.ETHEREUM)
    // const btcFee = await this.transactionService.getFee(ENetworks.BITCOIN)

    if (!ethMarketHistories.success || !btcMarketHistories.success) {
      Sentry.captureException('Something went wrong in Morty service')
      throw new InternalServerErrorException("Couldn't get market price ")
    }

    // if (!ethFee.success || !btcFee.success) {
    //   Sentry.captureException('Something went wrong in Transaction service')
    //   throw new InternalServerErrorException("Couldn't get fee price ")
    // }

    const newTransactions = transactions.map((transaction) => {
      const isEthereum = isAddress(transaction.from)
      const source = isEthereum
        ? ethMarketHistories.data
        : btcMarketHistories.data
      const decimal = isEthereum ? 18 : 8
      const price = this.getPrice(source, transaction.timestamp)
      const value = formatUnits(transaction.balance, decimal)
      const amount = formatUnits(transaction.amount, decimal)
      return {
        ...transaction,
        cryptoAmount: transaction.amount,
        fiatBalance: (+value * price).toString(),
        fiatAmount: (+amount * price).toString(),
      }
    })

    return newTransactions
  }

  // async fluffyAPICall(path, body) {
  //   try {
  //     const url = `${this.fluffyApiUrl}/${path}`
  //     const res = await firstValueFrom(
  //       this.httpService.put<AxiosResponse>(url, body),
  //     )
  //     return res.data
  //   } catch (err) {
  //     const message = err.response ? err.response.data.message : err.message

  //     Sentry.captureException(`fluffyAPICall(): ${message}`)

  //     if (err.response) {
  //       throw new InternalServerErrorException(message)
  //     }

  //     throw new BadGatewayException(
  //       `Fluffy server connection error: ${message}`,
  //     )
  //   }
  // }

  // async updatePassCode(
  //   walletId: number,
  //   deviceId: string,
  //   passCodeKey: string,
  // ) {
  //   this.validateAccountId(walletId)

  //   const path = `${deviceId}/wallets/${walletId}`
  //   return this.fluffyAPICall(path, { passCodeKey })
  // }

  // async updateIsCloud(walletId: number, deviceId: string, isCloud: boolean) {
  //   this.validateAccountId(walletId)

  //   const path = `${deviceId}/wallets/${walletId}`
  //   return this.fluffyAPICall(path, { isCloud })
  // }

  // async getAccount(accountId: number) {
  //   try {
  //     const accountResponse = await firstValueFrom(
  //       this.httpService.get(`${this.gandalfApiUrl}/auth/${accountId}`),
  //     )
  //     return accountResponse.data
  //   } catch (err) {
  //     Sentry.captureException(`getAccount(): ${err.message}`)
  //     throw new BadGatewayException(err.message)
  //   }
  // }
}
