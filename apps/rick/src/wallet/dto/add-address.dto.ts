import { WalletEntity } from '../wallet.entity'

export class AddAddressDto {
  wallet: WalletEntity
  address: string
  path: string
}
