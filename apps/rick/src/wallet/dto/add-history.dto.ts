import { AddressEntity } from './../address.entity'

export class AddHistoryDto {
  address: AddressEntity
  balance: string
  from: string
  to: string
  amount: string
  hash: string
  timestamp: number
}
