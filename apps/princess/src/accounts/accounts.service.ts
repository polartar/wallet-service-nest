import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EPeriod, EWalletType } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { UpdateWalletDto } from './dto/UpdateWalletDto'
import { EAPIMethod } from './accounts.typs'
import { AxiosResponse } from 'axios'
import { REQUEST } from '@nestjs/core'

@Injectable()
export class AccountsService {
  rickApiUrl: string
  fluffyApiUrl: string
  gandalfApiUrl: string

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(REQUEST) private readonly request: Request,
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
    return Number((this.request as any).accountId)
  }

  validateAccountId(accountId: number) {
    if (accountId === this.getAccountIdFromRequest()) {
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
          ? this.httpService.post<AxiosResponse>(url, body)
          : this.httpService.get<AxiosResponse>(url),
      )
      return res.data
    } catch (err) {
      if (err.response) {
        throw new InternalServerErrorException(
          'Something went wrong in Rick API',
        )
      }
      throw new BadGatewayException('Rick server connection error')
    }
  }

  async createWallet(accountId: number, walletType: EWalletType, xPub: string) {
    this.validateAccountId(accountId)

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
    this.validateAccountId(accountId)

    return this.rickAPICall(
      EAPIMethod.GET,
      `wallet/${accountId}?period=${period}`,
    )
  }

  async getWalletPortfolio(accountId: number, walletId, period?: EPeriod) {
    this.validateAccountId(accountId)

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
        throw new InternalServerErrorException(err.response.data.message)
      }
      throw new BadGatewayException('Fluffy server connection error')
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
    this.validateAccountId(accountId)

    try {
      const accountResponse = await firstValueFrom(
        this.httpService.get(`${this.gandalfApiUrl}/auth/${accountId}`),
      )
      return accountResponse.data
    } catch (err) {
      throw new BadGatewayException(err.message)
    }
  }

  async createAccount(email: string, name: string) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.rickApiUrl}/account`, { email, name }),
    )
    return response.data
  }
}
