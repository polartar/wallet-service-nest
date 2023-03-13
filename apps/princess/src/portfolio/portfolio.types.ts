import { Socket } from 'socket.io'

export enum IWalletType {
  ETHEREUM = 'eth',
  BITCOIN = 'btc',
}

export interface IAccount {
  id?: number
  email: string
  name: string
}

export interface IWallet {
  id?: number
  address: string
  type: IWalletType
  balanceHistory: string
  isActive?: boolean
  account: IAccount
}

export interface IBalanceHistory {
  balance: string
  date: number
}

export interface IUpdatedHistory {
  [accountId: string]: IWallet[]
}

export interface ISockets {
  [accountId: number]: Socket
}
