import { AssetEntity } from '../wallet/asset.entity'

export interface IBTCTransactionResponse {
  balance: number
  txrefs: IBTCTransaction[]
}

export interface IBTCTransaction {
  tx_hash: string
  block_height: number
  tx_input_n: number
  tx_output_n: number
  value: number
  spent?: boolean
  ref_balance: number
  confirmations: number
  confirmed: string
}

export class ITransaction {
  asset: AssetEntity
  balance: string
  from: string
  to: string
  amount?: string
  tokenId?: string
  hash: string
  timestamp: number
}
