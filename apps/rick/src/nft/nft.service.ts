import { NftEntity } from '../wallet/nft.entity'
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
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class NftService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(NftEntity)
    private readonly nftRepository: Repository<NftEntity>,
  ) {
    const moralisAPIKey = this.configService.get<string>(
      EEnvironment.moralisAPIKey,
    )
    if (!Moralis.Core.isStarted) {
      Moralis.start({
        apiKey: moralisAPIKey,
      })
    }
  }

  async getNFTAssets(address: string, network: ENetworks): Promise<boolean> {
    try {
      let response = await Moralis.EvmApi.nft.getWalletNFTs({
        address: address,
        chain:
          network === ENetworks.ETHEREUM ? EvmChain.ETHEREUM : EvmChain.GOERLI,
      })

      const obj = response.toJSON()
      await this.storeNfts(obj.result, network)

      while (response.hasNext()) {
        response = await response.next()
        const obj = response.toJSON()
        await this.storeNfts(obj.result, network)
      }

      return true
    } catch (err) {
      Sentry.captureException(`getNFTAssets(): ${err.mesage}`)

      throw new InternalServerErrorException(err.message)
    }
  }

  async storeNfts(nfts: INFTInfo[], network: ENetworks) {
    if (nfts.length == 0) {
      return false
    }
    const entities: NftEntity[] = nfts.map((nft) => {
      const metadata = JSON.parse(nft.metadata)
      const prototype = new NftEntity()
      prototype.name = metadata.name
      prototype.description = metadata.description
      prototype.image = metadata.image
      prototype.externalUrl = metadata.externalUrl
      prototype.attributes = metadata.attributes.map((attribute) => ({
        traitType: attribute.trait_type,
        value: attribute.value,
      }))
      prototype.ownerOf = nft.owner_of
      prototype.hash = nft.token_hash
      prototype.contractType = nft.contract_type
      prototype.network = network
      prototype.tokenId = nft.token_id
      return prototype
    })

    await this.nftRepository.insert(entities)
  }
}
