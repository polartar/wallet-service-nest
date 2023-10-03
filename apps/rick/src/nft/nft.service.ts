import { NftEntity } from '../wallet/nft.entity'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Moralis from 'moralis'
import { EvmChain } from '@moralisweb3/common-evm-utils'
import { EEnvironment } from '../environments/environment.types'
import { INFTInfo } from './nft.types'
import * as Sentry from '@sentry/node'
import { ENetworks } from '@rana/core'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AssetEntity } from '../wallet/asset.entity'

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

  async getNFTAssets(asset: AssetEntity): Promise<boolean> {
    try {
      let response = await Moralis.EvmApi.nft.getWalletNFTs({
        address: asset.address,
        chain:
          asset.network === ENetworks.ETHEREUM
            ? EvmChain.ETHEREUM
            : EvmChain.GOERLI,
      })

      const obj = response.toJSON()
      await this.storeNfts(asset, obj.result)

      while (response.hasNext()) {
        response = await response.next()
        const obj = response.toJSON()
        await this.storeNfts(asset, obj.result)
      }

      return true
    } catch (err) {
      Sentry.captureException(`getNFTAssets(): ${err.mesage}`)

      throw new InternalServerErrorException(err.message)
    }
  }

  async storeNfts(assetEntity: AssetEntity, nfts: INFTInfo[]) {
    if (nfts.length == 0) {
      return false
    }

    const entities: NftEntity[] = nfts.map((nft) => {
      const metadata = JSON.parse(nft.metadata)
      const prototype = new NftEntity()
      prototype.asset = assetEntity
      prototype.name = metadata.name
      prototype.collectionAddress = nft.token_address
      prototype.description = metadata.description
      prototype.image = metadata.image
      prototype.externalUrl = metadata.externalUrl
      prototype.attributes = metadata.attriutes
        ? metadata.attributes.map((attribute) => ({
            traitType: attribute.trait_type,
            value: attribute.value,
          }))
        : []
      prototype.ownerOf = nft.owner_of
      prototype.hash = nft.token_hash
      prototype.amount = nft.amount
      prototype.contractType = nft.contract_type
      prototype.network = assetEntity.network
      prototype.tokenId = nft.token_id
      return prototype
    })

    await this.nftRepository.insert(entities)
  }
}
