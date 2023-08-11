import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Inject,
  Injectable,
  Request,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { ENetworks, EPeriod } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { EAPIMethod } from './wallet.types'
import * as Sentry from '@sentry/node'
import { REQUEST } from '@nestjs/core'
import { IRequest } from '../accounts/accounts.types'
import { CreateWalletDto } from './dto/create-wallet.dto'
import { AssetService } from '../asset/asset.service'

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
    private readonly assetService: AssetService,
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

  getAccountIdFromRequest(): string {
    return (this.request as IRequest).accountId
  }

  getDeviceIdFromRequest(): string {
    return (this.request as IRequest).deviceId
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
          : method === EAPIMethod.PATCH
          ? this.httpService.patch(url, body)
          : method === EAPIMethod.DELETE
          ? this.httpService.delete(url)
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

  async getWalletTransaction(walletId, start = 0, count = 50) {
    const accountId = this.getAccountIdFromRequest()
    const transactions = await this.apiCall(
      EAPIMethod.GET,
      this.rickApiUrl,
      `wallet/${walletId}/transactions?accountId=${accountId}&count=${count}&start=${start}`,
    )

    return transactions
  }

  async getWallet(walletId) {
    const accountId = this.getAccountIdFromRequest()

    return await this.apiCall(
      EAPIMethod.GET,
      this.rickApiUrl,
      `wallet/${walletId}?accountId=${accountId}`,
    )
  }

  async getWalletPortfolio(walletId, period: EPeriod, networks: ENetworks[]) {
    const accountId = this.getAccountIdFromRequest()

    return await this.apiCall(
      EAPIMethod.GET,
      this.rickApiUrl,
      `wallet/${walletId}/portfolio?accountId=${accountId}&period=${
        period ? period : EPeriod.All
      }&networks=${networks ? networks : ''}`,
    )
  }

  async getWallets() {
    const accountId = this.getAccountIdFromRequest()

    return await this.apiCall(
      EAPIMethod.GET,
      this.rickApiUrl,
      `wallet?accountId=${accountId}`,
    )
  }

  async createWallet(data: CreateWalletDto) {
    const accountId = this.getAccountIdFromRequest()

    if (data.assets.length > 0) {
      return await this.apiCall(EAPIMethod.POST, this.rickApiUrl, `wallet`, {
        accountId,
        title: data.title,
        mnemonic: data.mnemonic,
        assetIds: data.assets,
      })
    } else {
      throw new BadRequestException('Invalid asset ids')
    }

    // return this.addUSDPrice([wallet], EPeriod.Day)
  }

  async sync(title: string, parts: string[]) {
    const accountId = this.getAccountIdFromRequest()
    if (parts.length === 0) {
      throw new BadRequestException('Invalid parts')
    }

    const coinsResponse = await this.apiCall(
      EAPIMethod.POST,
      this.bristleApiUrl,
      'sync',
      { parts },
    )

    try {
      const wallet = await this.apiCall(
        EAPIMethod.POST,
        this.rickApiUrl,
        'wallet/vault',
        { title, accountId, coins: coinsResponse },
      )
      return wallet
    } catch (err) {
      Sentry.captureException(`Sync(): ${err.message}`)

      throw new BadRequestException(`${err.message}`)
    }
  }

  async updateWallet(walletId: string, title: string, mnemonic: string) {
    const accountId = this.getAccountIdFromRequest()

    return this.apiCall(
      EAPIMethod.PATCH,
      this.rickApiUrl,
      `wallet/${walletId}`,
      {
        accountId,
        title,
        mnemonic,
      },
    )
  }

  async deleteWallet(walletId: string) {
    const accountId = this.getAccountIdFromRequest()

    return this.apiCall(
      EAPIMethod.DELETE,
      this.rickApiUrl,
      `wallet/${walletId}`,
      {
        accountId,
      },
    )
  }

  async addAsset(walletId: string, assetId: string) {
    const accountId = this.getAccountIdFromRequest()

    return this.apiCall(
      EAPIMethod.PATCH,
      this.rickApiUrl,
      `wallet/${walletId}/asset`,
      {
        accountId,
        assetId,
      },
    )
  }
}
