import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EPeriod, EWalletType } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { UpdateWalletDto } from './dto/UpdateWalletDto'

@Injectable()
export class AccountsService {
  rickApiUrl: string

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
  }

  async createWallet(accountId: string, walletType: EWalletType, xPub: string) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.rickApiUrl}/wallet/${xPub}`, {
        account_id: accountId,
        wallet_type: walletType,
      }),
    )
    return response.data
  }

  async updateWallet(
    accountId: string,
    walletId: string,
    data: UpdateWalletDto,
  ) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.rickApiUrl}/wallet/activate`, {
        account_id: accountId, // depending on the authorization flow between princess and rick
        id: walletId,
        is_active: data.is_active,
      }),
    )
    return response.data
  }

  async getPortfolio(accountId: number, period?: EPeriod) {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.rickApiUrl}/wallet/${accountId}?period=${period}`,
      ),
    )
    return response.data
  }

  async createAccount(email: string, name: string) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.rickApiUrl}/account}`, { email, name }),
    )
    return response.data
  }
}
