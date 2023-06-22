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
import { EAuth, EPeriod } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { AxiosResponse } from 'axios'
import { EAPIMethod, IAddress, IWallet } from './accounts.types'
import * as Sentry from '@sentry/node'
import { REQUEST } from '@nestjs/core'
import { IRequest } from './accounts.types'
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
