import { AddressEntity } from './../address.entity'

export class AddHistoryDto {
  address: AddressEntity
  balance: string
  from: string
  to: string
  amount?: string
  tokenId?: string
  hash: string
  timestamp: number
}
