import { AssetEntity } from '../asset.entity'

export class AddHistoryDto {
  asset: AssetEntity
  balance: string
  from: string
  to: string
  amount?: string
  tokenId?: string
  hash: string
  timestamp: number
}
