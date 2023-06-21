import { ENetworks, EWalletType } from '@rana/core'
import { Socket } from 'socket.io'

export interface IAccount {
  id?: number
  email: string
  name: string
}

export interface IWallet {
  id: number
  coinType: ENetworks
  xPub: string
  type: EWalletType
  address: string
  accounts: IAccount[]
  addresses: IAddress[]
  isActive: boolean
  path: string
  createdAt: number
}

export interface IAddress {
  id: number
  address: string
  createdAt: number
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
  [accountId: string]: IUpdatedAddress[]
}

export interface ISockets {
  [accountId: number]: Socket
}

export interface IWalletHistoryResponse {
  success: boolean
  data?: {
    period: string
    wallets: IWallet[]
  }[]
  error?: string
}

export interface IUpdatedAddress {
  addressId: number
  walletId: number
  accountIds: number[]
  newHistory?: {
    from: string
    to: string
    amount: string
    hash: string
    balance: string
    timestamp: number
  }
}
