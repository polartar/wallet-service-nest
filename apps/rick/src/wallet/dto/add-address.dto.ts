import { ENetworks } from '@rana/core'
import { WalletEntity } from '../wallet.entity'

export class AddAddressDto {
  wallet: WalletEntity
  address: string
  path: string
  network: ENetworks
}
