import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Inject,
  Injectable,
  Request,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { REQUEST } from '@nestjs/core'
import { EEnvironment } from '../environments/environment.types'
import { IRequest } from '../accounts/accounts.types'
import { CreateAssetDto } from './dto/create-asset.dto'
import { EAPIMethod } from '../wallet/wallet.types'
import { firstValueFrom } from 'rxjs'
import * as Sentry from '@sentry/node'
import { ENetworks, EPeriod } from '@rana/core'

@Injectable()
export class AssetService {
  rickApiUrl: string
  magicApiUrl: string

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
    this.magicApiUrl = this.configService.get<string>(EEnvironment.magicAPIUrl)
  }

  getAccountIdFromRequest(): string {
    return (this.request as IRequest).accountId
  }

  async rickApiCall(method: EAPIMethod, path: string, body?: unknown) {
    try {
      const url = `${this.rickApiUrl}/${path}`
      const res = await firstValueFrom(
        method === EAPIMethod.POST
          ? this.httpService.post(url, body)
          : this.httpService.get(url),
      )

      return res.data
    } catch (err) {
      if (err.response) {
        Sentry.captureException(
          `${err.response.data.message}: ${this.rickApiUrl}/${path} API call`,
        )
        throw new BadRequestException(err.response.data.message)
      } else {
        Sentry.captureException(
          `${err.message}: ${this.rickApiUrl}/${path} API call`,
        )

        throw new BadRequestException(err.message)
      }
    }
  }

  async createAsset(data: CreateAssetDto) {
    // let asset
    if (data.xPub) {
      const response = await this.rickApiCall(
        EAPIMethod.POST,
        'asset/discover',
        data,
      )

      const assets = response.map((item) => item.asset)
      if (assets.some((asset) => asset.network === ENetworks.BITCOIN)) {
        try {
          await firstValueFrom(
            this.httpService.post(
              `${this.magicApiUrl}/transactions/subscribe-btc`,
            ),
          )
        } catch (err) {
          Sentry.captureException(`handleWebhook(): ${err.message}`)
        }
      }

      return assets
    } else {
      const { asset, isNew } = await this.rickApiCall(
        EAPIMethod.POST,
        'asset',
        data,
      )

      if (isNew && asset.network === ENetworks.BITCOIN) {
        try {
          await firstValueFrom(
            this.httpService.post(
              `${this.magicApiUrl}/transactions/subscribe-btc`,
            ),
          )
        } catch (err) {
          Sentry.captureException(`handleWebhook(): ${err.message}`)
        }
      }
      return [asset]
    }
  }

  async getAsset(assetId: string) {
    const accountId = this.getAccountIdFromRequest()
    const asset = await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}?accountId=${accountId}`,
    )

    return asset
  }

  async getAssetTransactions(assetId: string) {
    const accountId = this.getAccountIdFromRequest()
    return await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}/transactions?accountId=${accountId}`,
    )
  }

  async getAssetPortfolio(assetId, period?: EPeriod) {
    const accountId = this.getAccountIdFromRequest()

    return await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}/portfolio?accountId=${accountId}&period=${
        period ? period : EPeriod.Month
      }`,
    )
  }

  async getAssetNFTs(assetId: string, pageNumber?: number) {
    const page = pageNumber || 1

    return await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}/nft?pageNumber=${page}`,
    )
  }
}
