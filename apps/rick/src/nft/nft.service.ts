import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Moralis from 'moralis'
import { EvmChain } from '@moralisweb3/common-evm-utils'
import { EEnvironment } from '../environments/environment.types'
import { INFTAssetResponse, INFTInfo } from './nft.types'
import * as Sentry from '@sentry/node'
import { ENetworks, getTimestamp } from '@rana/core'

@Injectable()
export class NftService {
  constructor(private configService: ConfigService) {
    const moralisAPIKey = this.configService.get<string>(
      EEnvironment.moralisAPIKey,
    )
    if (!Moralis.Core.isStarted) {
      Moralis.start({
        apiKey: moralisAPIKey,
      })
    }
  }

  async getNFTAssets(
    address: string,
    network: ENetworks,
    pageNumber: number,
  ): Promise<INFTAssetResponse> {
    try {
      let response = await Moralis.EvmApi.nft.getWalletNFTs({
        address: address,
        chain:
          network === ENetworks.ETHEREUM ? EvmChain.ETHEREUM : EvmChain.GOERLI,
      })

      if (pageNumber && pageNumber > 1) {
        let currPage = 1
        while (currPage < pageNumber) {
          if (response.hasNext()) {
            response = await response.next()
            currPage++
          } else {
            Sentry.captureException(
              `getNFTAssets(): Exceed page number(${pageNumber})`,
            )
            throw new BadRequestException('Exceed page number')
          }
        }
      }

      const obj = response.toJSON()

      return {
        total: obj.total,
        pageNumber: obj.page,
        countPerPage: obj.page_size,
        hasNextPage: response.hasNext(),
        nfts: obj.result.map((item: INFTInfo) => ({
          ...item,
          metadata: JSON.parse(item.metadata),
          last_token_uri_sync: getTimestamp(item.last_token_uri_sync as string),
          last_metadata_sync: getTimestamp(item.last_metadata_sync as string),
        })),
      }
    } catch (err) {
      Sentry.captureException(`getNFTAssets(): ${err.mesage}`)

      throw new InternalServerErrorException(err.message)
    }
  }
}
