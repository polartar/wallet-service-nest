import { Request } from '@nestjs/common'
import { ENetworks } from '@rana/core'

export enum EAPIMethod {
  POST = 'post',
  GET = 'get',
}

export interface IMarketData {
  periodStart: string
  periodEnd: string
  vwap: number
}

export interface ITransaction {
  from: string

  to: string

  balance: string

  amount: number

  tokenId: number

  timestamp: number
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
