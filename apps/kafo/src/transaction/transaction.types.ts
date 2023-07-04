import { Transaction } from '@ethereumjs/tx'
import { ENetworks } from '@rana/core'

export interface ITransactionResponse {
  success: boolean
  error?: string
  data?: IVaultTransactionResponse
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
  amount: string
  coinType: ENetworks
  publicKey: string
}

export interface ITransactionPush {
  serializedTransaction: string
  signature: string
  coinType: ENetworks
}

export interface INFTTransactionInput {
  from: string
  to: string
  contractAddress: string
  tokenId: number
  amount?: number
  type: ENFTTypes
  publicKey: string
}

export enum ENFTTypes {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

export interface IVaultTransaction {
  type: number
  from: string
  to: string
  value: {
    value: string
    factor: number
  }
  extra: {
    publicKey: string
  }
  fee: {
    fee: {
      value: string
      factor: number
    }
  }
  signingPayloads: [
    {
      address: string
      publickey: string
      tosign: string
    },
  ]
  nativeTransaction: Transaction
}

interface IVaultTransactionResponse extends IVaultTransaction {
  signedPayload: string
  serializedTransaction: string
}
