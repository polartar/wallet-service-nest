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
// export interface IWallet {
//   id: number
//   assets: IAsset[]
// }

// export interface IAsset {
//   network: ENetworks
//   address: string
//   transactions: {
//     balance: string
//     amount: string
//     timestamp: number
//     usdBalance?: string
//     usdAmount: string
//   }[]
// }
