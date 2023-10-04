import { ENetworks } from '@rana/core'
import { AssetEntity } from '../wallet/asset.entity'
import { ETransactionStatuses, INftAttribute } from '../wallet/wallet.types'
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
  usdPrice: string
  from: string
  to: string
  cryptoAmount?: string
  fiatAmount?: string
  tokenId?: number
  hash: string
  timestamp: number
  status: ETransactionStatuses
  fee: string
  blockNumber?: number
}

export interface INft {
  id: string
  network: ENetworks
  contractType: string
  ownerOf: string
  hash: string
  name: string
  tokenId: string
  description: string
  image: string
  externalUrl: string
  attributes: string
}
export interface IAssetDetail {
  id: string
  balance?: {
    fiat: string
    crypto: string
  }
  network: ENetworks
  index: number
  address: string
  publicKey: string
  nfts: INft[]
}

export interface IXPubInfo {
  path: string
  address: string
  publickey: string
  index: 0
}
