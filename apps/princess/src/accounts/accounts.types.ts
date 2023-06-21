import { Request } from '@nestjs/common'
import { ECoinType } from '@rana/core'

export enum EAPIMethod {
  POST = 'post',
  GET = 'get',
}

export interface IRequest extends Request {
  accountId: number
  deviceId: string
}

export interface IMarketData {
  periodStart: string
  periodEnd: string
  vwap: number
}

export interface IWallet {
  id: number
  addresses: IAddress[]
}

export interface IAddress {
  coinType: ECoinType
  address: string
  history: {
    balance: string
    amount: string
    timestamp: number
    usdBalance?: string
    usdAmount: string
  }[]
}
