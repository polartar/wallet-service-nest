import { ICoinType, IWalletType } from '@rana/core'
import { Socket } from 'socket.io'

export interface IAccount {
  id?: number
  email: string
  name: string
}

export interface IWallet {
  id: number
  coinType: ICoinType
  xPub: string
  type: IWalletType
  address: string
  accounts: IAccount[]
  addresses: IAddress[]
  isActive: boolean
  path: string
  createdAt: Date
}

export interface IAddress {
  id: number
  address: string
  createdAt: Date
  path: string
  wallet: IWallet
  history: IBalanceHistory[]
  isActive: boolean
}

export interface IHistory {
  id: number
  address: IAddress
  balance: string
  from: string
  to: string
  hash: string
  amount: string
  timestamp: number
}

export interface IBalanceHistory {
  balance: string
  date: number
}

export interface IUpdatedHistory {
  [accountId: string]: IAddress[]
}

export interface ISockets {
  [accountId: number]: Socket
}
