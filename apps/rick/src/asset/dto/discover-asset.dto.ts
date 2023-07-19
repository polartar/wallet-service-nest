import { ENetworks } from '@rana/core'

export class DiscoverAssetDto {
  xPub: string
  address: string
  index: number
  network: ENetworks
  publicKey: string
}
