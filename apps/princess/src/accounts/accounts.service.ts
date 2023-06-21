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
import { EAPIMethod, IAddress, IMarketData, IWallet } from './accounts.types'
import * as Sentry from '@sentry/node'
import { MarketService } from '../market/market.service'
import { formatUnits } from 'ethers/lib/utils'
import { REQUEST } from '@nestjs/core'
import { IRequest } from './accounts.types'
import { TransactionService } from '../transaction/transaction.service'
import { AuthService } from '../auth/auth.service'

@Injectable()
export class AccountsService {
  rickApiUrl: string
  fluffyApiUrl: string
  gandalfApiUrl: string

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly marketService: MarketService,
    private readonly transactionService: TransactionService,
    private readonly authService: AuthService,
  ) {
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
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
      throw new BadRequestException('Account Id  not matched')
    }
  }

  async rickAPICall(method: EAPIMethod, path: string, body?: unknown) {
    try {
      const url = `${this.rickApiUrl}/${path}`
      const res = await firstValueFrom(
        method === EAPIMethod.POST
          ? this.httpService.post(url, body)
          : this.httpService.get(url),
      )
      return res.data
    } catch (err) {
      const message = err.response ? err.response.data.message : err.message
      Sentry.captureException(`rickAPICall(): ${message}`)

      if (err.response) {
        throw new InternalServerErrorException(message)
      }
      throw new BadGatewayException(`Rick server connection error: ${message}`)
    }
  }

  async createWallet(accountId: number, walletType: EWalletType, xPub: string) {
    this.validateAccountId(accountId)

    const wallet = await this.rickAPICall(EAPIMethod.POST, `wallet`, {
      account_id: accountId,
      wallet_type: walletType,
      xPub: xPub,
    })

    return this.addUSDPrice([wallet], EPeriod.All)
  }

  async updateWallet(
    accountId: number,
    walletId: string,
    data: UpdateWalletDto,
  ) {
    this.validateAccountId(accountId)

    return this.rickAPICall(EAPIMethod.POST, `wallet/activate`, {
      account_id: accountId,
      accountId: walletId,
      is_active: data.is_active,
    })
  }

  getPrice(source: IMarketData[], timestamp: number) {
    const index = source.findIndex(
      (market) =>
        new Date(market.periodEnd).getTime() / 1000 >= +timestamp &&
        +timestamp >= new Date(market.periodStart).getTime() / 1000,
    )

    return index !== -1 ? source[index].vwap : source[source.length - 1].vwap
  }

  async addUSDPrice(wallets: IWallet[], period: EPeriod) {
    const ethMarketHistories = await this.marketService.getHistoricalData(
      ENetworks.ETHEREUM,
      period,
    )

    const btcMarketHistories = await this.marketService.getHistoricalData(
      ENetworks.BITCOIN,
      period,
    )
    const ethFee = await this.transactionService.getFee(ENetworks.ETHEREUM)
    const btcFee = await this.transactionService.getFee(ENetworks.BITCOIN)

    if (!ethMarketHistories.success || !btcMarketHistories.success) {
      Sentry.captureException('Something went wrong in Morty service')
      return wallets
    }

    if (!ethFee.success || !btcFee.success) {
      Sentry.captureException('Something went wrong in Transaction service')
      return wallets
    }

    return wallets.map((wallet) => {
      wallet.addresses = wallet.addresses.map((address) => {
        const isEthereum = address.coinType === ENetworks.ETHEREUM
        const source = isEthereum
          ? ethMarketHistories.data
          : btcMarketHistories.data
        const decimal = isEthereum ? 18 : 8
        const history = address.history.map((item) => {
          const price = this.getPrice(source, item.timestamp)
          const value = formatUnits(item.balance, decimal)
          const amount = formatUnits(item.amount, decimal)
          return {
            ...item,
            usdBalance: (+value * price).toString(),
            usdAmount: (+amount * price).toString(),
          }
        })

        return {
          ...address,
          fee: isEthereum ? ethFee.data.convert : btcFee.data.convert,
          history,
        }
      })
      return wallet
    })
  }

  async getPortfolio(accountId: number, period?: EPeriod) {
    this.validateAccountId(accountId)

    const wallets: IWallet[] = await this.rickAPICall(
      EAPIMethod.GET,
      `wallet/${accountId}?period=${period}`,
    )

    return this.addUSDPrice(wallets, period)
  }

  async getWalletPortfolio(accountId: number, walletId, period?: EPeriod) {
    this.validateAccountId(accountId)

    const wallets: IWallet[] = await this.rickAPICall(
      EAPIMethod.GET,
      `wallet/${accountId}/wallet/${walletId}?period=${period}`,
    )

    return this.addUSDPrice(wallets, period)
  }

  async fluffyAPICall(path, body) {
    try {
      const url = `${this.fluffyApiUrl}/${path}`
      const res = await firstValueFrom(
        this.httpService.put<AxiosResponse>(url, body),
      )
      return res.data
    } catch (err) {
      const message = err.response ? err.response.data.message : err.message

      Sentry.captureException(`fluffyAPICall(): ${message}`)

      if (err.response) {
        throw new InternalServerErrorException(message)
      }

      throw new BadGatewayException(
        `Fluffy server connection error: ${message}`,
      )
    }
  }

  async updatePassCode(
    accountId: number,
    deviceId: string,
    passCodeKey: string,
  ) {
    this.validateAccountId(accountId)

    const path = `${deviceId}/accounts/${accountId}`
    return this.fluffyAPICall(path, { passCodeKey })
  }

  async updateIsCloud(accountId: number, deviceId: string, isCloud: boolean) {
    this.validateAccountId(accountId)

    const path = `${deviceId}/accounts/${accountId}`
    return this.fluffyAPICall(path, { isCloud })
  }

  async getAccount(accountId: number) {
    try {
      const accountResponse = await firstValueFrom(
        this.httpService.get(`${this.gandalfApiUrl}/auth/${accountId}`),
      )
      return accountResponse.data
    } catch (err) {
      Sentry.captureException(`getAccount(): ${err.message}`)
      throw new BadGatewayException(err.message)
    }
  }

  async syncAccount(hash: string): Promise<IWallet[]> {
    const accountId = this.getAccountIdFromRequest()
    const wallets: IWallet[] = await this.rickAPICall(
      EAPIMethod.GET,
      `wallet/${accountId}?period=${EPeriod.Day}`,
    )

    const addresses = wallets.reduce(
      (allAddresses: IAddress[], wallet: IWallet) =>
        allAddresses.concat(allAddresses, wallet.addresses),
      [],
    )

    const walletHash = addresses.map((address) => address.address).join(',')
    if (walletHash === hash) {
      return []
    } else {
      return wallets
    }
  }

  async createAccount(provider: EAuth, providerToken: string, otp: string) {
    const deviceId = this.getDeviceIdFromRequest()
    this.authService.signIn(provider, providerToken, deviceId, otp)
  }
}
