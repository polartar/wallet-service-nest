import { ENetworks } from '@rana/core'

export class CreateAssetDto {
  address: string
  publicKey: string
  index: number
  network: ENetworks
}
