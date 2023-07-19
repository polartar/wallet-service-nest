import { ENetworks } from '@rana/core'
import { AssetEntity } from '../wallet/asset.entity'
import { ETransactionStatuses } from '../wallet/wallet.types'
import { INFTInfo } from '../nft/nft.types'

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
  tokenId?: number
  hash: string
  timestamp: number
  status: ETransactionStatuses
  fee: string
}

export interface IAssetDetail {
  id: string
  transaction?: ITransaction
  network: ENetworks
  index: number
  address: string
  publicKey: string
  nfts: INFTInfo[]
}

export interface IXPubInfo {
  path: string
  address: string
  publickey: string
  index: 0
}
