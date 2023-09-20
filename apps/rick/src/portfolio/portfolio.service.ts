import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { HttpService } from '@nestjs/axios'
import { ENetworks } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import * as Sentry from '@sentry/node'
import { AssetService } from '../asset/asset.service'
@Injectable()
export class PortfolioService implements OnModuleInit {
  princessAPIUrl: string
  webhookMainnetId: string
  webhookGoerliId: string
  webhookURL = 'https://dashboard.alchemy.com/api/update-webhook-addresses'
  updateWebhookURL =
    'https://dashboard.alchemy.com/api/update-webhook-addresses'
  alchemyAuthToken: string
  static INITIALIZED = false

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => AssetService))
    private readonly assetService: AssetService,
    private readonly httpService: HttpService,
  ) {
    this.princessAPIUrl = this.configService.get<string>(
      EEnvironment.princessAPIUrl,
    )
    this.webhookGoerliId = this.configService.get<string>(
      EEnvironment.webhookGoerliId,
    )

    this.webhookMainnetId = this.configService.get<string>(
      EEnvironment.webhookMainnetId,
    )
    this.alchemyAuthToken = this.configService.get<string>(
      EEnvironment.alchemyAuthToken,
    )
  }

  async onModuleInit() {
    if (PortfolioService.INITIALIZED === true) return

    const assets = await this.assetService.getAllAssets()
    const ethereumAddresses = assets
      .filter((asset) => asset.network === ENetworks.ETHEREUM)
      .map((asset) => asset.address)
    const goerliAddresses = assets
      .filter((asset) => asset.network === ENetworks.ETHEREUM_TEST)
      .map((asset) => asset.address)

    this.updateAddressesToWebhook(ethereumAddresses, ENetworks.ETHEREUM)
    this.updateAddressesToWebhook(goerliAddresses, ENetworks.ETHEREUM_TEST)

    PortfolioService.INITIALIZED = true
  }

  getCurrentTimeBySeconds() {
    return Math.floor(Date.now() / 1000)
  }

  async addAddressesToWebhook(
    addresses: string[],
    network: ENetworks,
    isRemove = false,
  ) {
    let webhookId = this.webhookGoerliId

    if (network === ENetworks.ETHEREUM) {
      webhookId = this.webhookMainnetId
    }
    firstValueFrom(
      this.httpService.patch(
        this.webhookURL,
        {
          webhook_id: webhookId,
          addresses_to_add: isRemove ? [] : addresses,
          addresses_to_remove: isRemove ? addresses : [],
        },
        {
          headers: { 'X-Alchemy-Token': this.alchemyAuthToken },
        },
      ),
    ).catch((err) => {
      Sentry.captureException(
        `Princess addAddressesToWebhook(): ${err.message}`,
      )
    })
  }

  async updateAddressesToWebhook(addresses: string[], network: ENetworks) {
    let webhookId = this.webhookGoerliId

    if (network === ENetworks.ETHEREUM) {
      webhookId = this.webhookMainnetId
    }
    firstValueFrom(
      this.httpService.put(
        this.updateWebhookURL,
        {
          webhook_id: webhookId,
          addresses: addresses,
        },
        {
          headers: { 'X-Alchemy-Token': this.alchemyAuthToken },
        },
      ),
    ).catch((err) => {
      Sentry.captureException(
        `Princess updateAddressesToWebhook(): ${err.message}`,
      )
    })
  }
}
