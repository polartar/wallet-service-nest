import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Moralis from 'moralis'
import { EvmChain } from '@moralisweb3/common-evm-utils'
import { EEnvironment } from '../environments/environment.types'
import { INFTAssetResponse, INTAssetInput } from './nft.types'
@Injectable()
export class NftService {
  alchemyInstance
  isProd
  constructor(private configService: ConfigService) {
    const moralisAPIKey = this.configService.get<string>(
      EEnvironment.moralisAPIKey,
    )
    this.isProd = this.configService.get<boolean>(EEnvironment.isProduction)
    if (!Moralis.Core.isStarted) {
      Moralis.start({
        apiKey: moralisAPIKey,
      })
    }
  }

  async getNFTAssets(query: INTAssetInput): Promise<INFTAssetResponse> {
    try {
      let response = await Moralis.EvmApi.nft.getWalletNFTs({
        address: query.address,
        chain: this.isProd ? EvmChain.ETHEREUM : EvmChain.GOERLI,
      })

      if (query.page && query.page > 1) {
        let currPage = 1
        while (currPage < query.page) {
          if (response.hasNext()) {
            response = await response.next()
            currPage++
          } else {
            return {
              success: false,
              error: 'Exceed page number',
            }
          }
        }
      }

      const obj = response.toJSON()

      return {
        success: true,
        data: {
          total: obj.total,
          pageNumber: obj.page,
          countPerPage: obj.page_size,
          isNextPage: response.hasNext(),
          nfts: obj.result,
        },
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
