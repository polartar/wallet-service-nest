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

export interface IMarketData {
  periodStart: string
  periodEnd: string
  vwap: number
}

export class IEthTransaction {
  from: string
  to: string
  gasUsed: string
  gasPrice: string
  value?: string
  isError: string
  type?: string
  hash: string
  timeStamp: number
  input: string
  blockNumber?: number
}

export class ITransaction {
  asset: AssetEntity
  balance: string
  usdBalance: string
  from: string
  to: string
  amount?: string
  usdAmount?: string
  tokenId?: number
  hash: string
  timestamp: number
  status: ETransactionStatuses
  fee: string
  blockNumber?: number
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
