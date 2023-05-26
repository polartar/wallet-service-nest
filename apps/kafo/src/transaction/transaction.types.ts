import { ECoinType } from '@rana/core'

export interface ITransactionResponse {
  success: boolean
  error?: string
  data?: ITransaction
  signature?: string
}
export interface IFeeResponse {
  success: boolean
  error?: string
  data?: {
    original: {
      high_fee: number
      medium_fee: number
      low_fee: number
    }
    convert: {
      high_fee: string
      medium_fee: string
      low_fee: string
    }
  }
}
export interface ITransactionInput {
  from: string
  to: string
  amount: number
  coinType: ECoinType
}

export interface ITransactionPush {
  transaction: ITransaction
  coinType: ECoinType
}

export interface ITx {
  block_height: number
  block_index: number
  hash: string
  addresses: string[]
  total: number
  fees: number
  size: number
  vsize: number
  preference: string
  relayed_by: string
  received: Date
  ver: number
  double_spend: boolean
  vin_sz: number
  vout_sz: number
  confirmations: 0
  inputs: []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputs: [any, any]
}
export interface ITransaction {
  tx: ITx
  tosign: string[]
  pubkeys?: string[]
  signatures?: string[]
}

export interface INFTTransactionInput {
  from: string
  to: string
  contractAddress: string
  tokenId: number
  amount?: number
  type: ENFTTypes
}

export enum ENFTTypes {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

export interface INFTTransactionResponse {
  success: boolean
  error?: string
  data?: string | object
  signature?: string
}
