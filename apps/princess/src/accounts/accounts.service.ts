import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EWalletType } from '@rana/core'
import { firstValueFrom } from 'rxjs'

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
}
