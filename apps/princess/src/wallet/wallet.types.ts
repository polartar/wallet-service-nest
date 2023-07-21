import { ENetworks } from '@rana/core'

export enum EAPIMethod {
  POST = 'post',
  GET = 'get',
  PATCH = 'patch',
  DELETE = 'delete',
  PUT = 'put',
}

export interface ITransaction {
  from: string
  to: string
  balance: string
  amount?: string
  tokenId: number
  timestamp: number
}

export interface IAsset {
  address: string
  network: ENetworks
  index: number
  transactions: ITransaction[]
}
