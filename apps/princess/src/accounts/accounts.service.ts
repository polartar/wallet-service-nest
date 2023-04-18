import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EPeriod, EWalletType } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { UpdateWalletDto } from './dto/UpdateWalletDto'
import { AxiosResponse } from 'axios'
import { EAPIMethod } from './accounts.types'
import * as Sentry from '@sentry/node'

@Injectable()
export class AccountsService {
  rickApiUrl: string
  fluffyApiUrl: string
  gandalfApiUrl: string

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService, // @Inject(REQUEST) private readonly request: Request,
  ) {
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
    this.gandalfApiUrl = this.configService.get<string>(
      EEnvironment.gandalfAPIUrl,
    )
    this.fluffyApiUrl = this.configService.get<string>(
      EEnvironment.fluffyAPIUrl,
    )
  }

  async rickAPICall(method: EAPIMethod, path: string, body?: unknown) {
    try {
      const url = `${this.rickApiUrl}/${path}`
      const res = await firstValueFrom(
        method === EAPIMethod.POST
          ? this.httpService.post<AxiosResponse>(url, body)
          : this.httpService.get<AxiosResponse>(url),
      )
      return res.data
    } catch (err) {
      if (err.response) {
        Sentry.captureException(err.response.data.message + ' in rickAPICall()')

        throw new InternalServerErrorException(
          'Something went wrong in Rick API',
        )
      }
      Sentry.captureException(err.message + ' in rickAPICall()')
      throw new BadGatewayException('Rick server connection error')
    }
  }

  async createWallet(accountId: number, walletType: EWalletType, xPub: string) {
    return this.rickAPICall(EAPIMethod.POST, `wallet/${xPub}`, {
      account_id: accountId,
      wallet_type: walletType,
    })
  }

  async updateWallet(
    accountId: number,
    walletId: string,
    data: UpdateWalletDto,
  ) {
    return this.rickAPICall(EAPIMethod.POST, `wallet/activate`, {
      account_id: accountId, // depending on the authorization flow between princess and rick
      id: walletId,
      is_active: data.is_active,
    })
  }

  async getPortfolio(accountId: number, period?: EPeriod) {
    return this.rickAPICall(
      EAPIMethod.GET,
      `wallet/${accountId}?period=${period}`,
    )
  }

  async getWalletPortfolio(accountId: number, walletId, period?: EPeriod) {
    return this.rickAPICall(
      EAPIMethod.GET,
      `wallet/${accountId}/wallet/${walletId}?period=${period}`,
    )
  }

  async fluffyAPICall(path, body) {
    try {
      const url = `${this.fluffyApiUrl}/${path}`
      const res = await firstValueFrom(
        this.httpService.put<AxiosResponse>(url, body),
      )
      return res.data
    } catch (err) {
      if (err.response) {
        Sentry.captureException(
          err.response.data.message + ' in fluffyAPICall()',
        )
        throw new InternalServerErrorException(err.response.data.message)
      }

      Sentry.captureException(err.message + ' in fluffyAPICall()')
      throw new BadGatewayException('Fluffy server connection error')
    }
  }

  async updatePassCode(
    accountId: number,
    deviceId: string,
    passCodeKey: string,
  ) {
    const path = `${deviceId}/accounts/${accountId}`
    return this.fluffyAPICall(path, { passCodeKey })
  }

  async updateIsCloud(accountId: number, deviceId: string, isCloud: boolean) {
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
      Sentry.captureException(err.message + ' in getAccount()')
      throw new BadGatewayException(err.message)
    }
  }
}
