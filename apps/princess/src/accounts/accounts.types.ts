import { Request } from '@nestjs/common'
import { ENetworks } from '@rana/core'

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
  coinType: ENetworks
  address: string
  history: {
    balance: string
    amount: string
    timestamp: number
    usdBalance?: string
    usdAmount: string
  }[]
}

export interface IAccount {
  id?: number
  email?: string
  name?: string
}

export interface ICreateAccountResponse {
  id: number
  email: string
  wallets: {
    id: number
    title: string
    xPub: string
    mnemonic: string
    assets: []
  }[]
}
