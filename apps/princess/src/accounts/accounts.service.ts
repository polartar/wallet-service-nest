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
import { EAPIMethod } from './accounts.typs'
import { AxiosResponse } from 'axios'

@Injectable()
export class AccountsService {
  rickApiUrl: string

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
  }

  async apiCall(method: EAPIMethod, path: string, body?: unknown) {
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

  async createWallet(accountId: string, walletType: EWalletType, xPub: string) {
    return this.apiCall(EAPIMethod.POST, `wallet/${xPub}`, {
      account_id: accountId,
      wallet_type: walletType,
    })
  }

  async updateWallet(
    accountId: string,
    walletId: string,
    data: UpdateWalletDto,
  ) {
    return this.apiCall(EAPIMethod.POST, `wallet/activate`, {
      account_id: accountId, // depending on the authorization flow between princess and rick
      id: walletId,
      is_active: data.is_active,
    })
  }

  async getPortfolio(accountId: number, period?: EPeriod) {
    return this.apiCall(EAPIMethod.GET, `wallet/${accountId}?period=${period}`)
  }

  async getWalletPortfolio(accountId: number, walletId, period?: EPeriod) {
    return this.apiCall(
      EAPIMethod.GET,
      `wallet/${accountId}/wallet/${walletId}?period=${period}`,
    )
  }
}
