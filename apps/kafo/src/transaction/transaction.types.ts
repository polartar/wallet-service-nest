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

export interface ITokenTransfer {
  id: string
  tokenId: string
  collectionId: string
  type: string
}
export interface ITransactionInput {
  from: string
  to: string
  amount: string
  network: ENetworks
  transferMessage?: string
  publicKey: string
  tokenTransfer: ITokenTransfer
}

export interface ITransactionPush {
  serializedTransaction: string
  signedPayloads: []
  network: ENetworks
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
    serverSignature?: string
  }
  fee: {
    fee: {
      value: string
      factor: number
    }
  }
  signingPayloads: {
    address: string
    publickey: string
    tosign: string
    derivation?: {
      account: number
      index: number
    }
  }[]

  nativeTransaction: Transaction
}

export interface IVaultTransactionResponse extends IVaultTransaction {
  signedPayload: string
  serializedTransaction: string
}

export interface IVaultTransactionInput {
  serializedTransaction: string
  derivedIndex: number
  network: ENetworks
}
export interface IVaultPublishTransactionInput {
  serializedTransaction: string
  parts: string[]
  network: ENetworks
}

export interface ITransactionRequest {
  type?: number
  from: string
  to: string
  value: {
    value: string
    factor: number
  }
  extra: {
    transferMessage: string
    publicKey: string
  }
  isNft?: boolean
  tokenTransfer?: ITokenTransfer
  fee?: {
    fee: {
      value: string
      factor: number
    }
  }
}
