import { Transaction } from '@ethereumjs/tx'
import { ENetworks } from '@rana/core'

export interface IFeeResponse {
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
export enum EAPIMethod {
  POST = 'post',
  GET = 'get',
  PATCH = 'patch',
  DELETE = 'delete',
  PUT = 'put',
}
export interface ITransactionInput {
  from: string
  to: string
  amount: string
  network: ENetworks
  transferMessage?: string
  publicKey: string
}

export interface ITransactionPush {
  serializedTransaction: string
  signedPayloads: []
  network: ENetworks
}

export interface INFTTransactionInput {
  from: string
  to: string
  contractAddress: string
  tokenId: number
  amount?: number
  type: ENFTTypes
  publicKey: string
  network: ENetworks
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

export interface IVaultTransactionResponse extends IVaultTransaction {
  signedPayload: string
  serializedTransaction: string
}
export enum EXPubCurrency {
  ETHEREUM = 'ethereum.secp256k1',
  BITCOIN = 'segwit.bitcoin.secp256k1',
}
