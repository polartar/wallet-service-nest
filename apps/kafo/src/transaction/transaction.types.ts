import { ICoinType } from '@rana/core'

export interface ITransactionResponse {
  success: boolean
  errors?: []
  data?: ITransaction
}
export interface IFeeResponse {
  success: boolean
  errors?: []
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
  coinType: ICoinType
}

export interface ITransactionPush {
  transaction: ITransaction
  coinType: ICoinType
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
}
