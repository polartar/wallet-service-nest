import { Request } from '@nestjs/common'
import { ECoinType } from '@rana/core'

export enum EAPIMethod {
  POST = 'post',
  GET = 'get',
}

export interface IRequest extends Request {
  accountId: number
}

export interface IMarketData {
  periodStart: string
  periodEnd: string
  vwap: number
}

export interface IWallet {
  addresses: {
    coinType: ECoinType
    history: {
      balance: string
      timestamp: string
      usdPrice?: string
    }[]
  }[]
}
