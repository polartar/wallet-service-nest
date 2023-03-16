import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Network, Alchemy } from 'alchemy-sdk'
import { EEnvironment } from '../environments/environment.types'
import { INFTAssetResponse } from './nft.types'
@Injectable()
export class NftService {
  alchemyInstance
  constructor(private configService: ConfigService) {
    const alchemyAPIKey = this.configService.get<string>(
      EEnvironment.alchemyAPIKey,
    )
    const isProd = this.configService.get<boolean>(EEnvironment.isProduction)
    const settings = {
      apiKey: alchemyAPIKey,
      network: isProd ? Network.ETH_MAINNET : Network.ETH_GOERLI,
    }

    this.alchemyInstance = new Alchemy(settings)
  }

  async getNFTAssets(address: string): Promise<INFTAssetResponse> {
    try {
      const response = await this.alchemyInstance.nft.getNftsForOwner(address, {
        pageKey:
          'MHg2NWYyZDE0MzliMGQzN2QyMTZmOGUxMTk0NWEzZWUwMmQ1MWI0YjJmOjB4ZWI6ZmFsc2U=',
      })

      return {
        success: true,
        data: response.ownedNfts,
      }
    } catch (err) {
      Logger.error(err.message)
      return {
        success: false,
        error: err.message,
      }
    }
  }
}
