import { ENetworks, EWalletType } from '@rana/core'
import { Socket } from 'socket.io'

export interface IAccount {
  id?: string
  email: string
  name: string
}

export interface IWallet {
  id: string
  coinType: ENetworks
  xPub: string
  type: EWalletType
  address: string
  accounts: IAccount[]
  addresses: IAddress[]
  path: string
  createdAt: number
}

export interface IAddress {
  id: string
  address: string
  createdAt: number
  path: string
  wallet: IWallet
  history: IBalanceHistory[]
}

export interface IBalanceHistory {
  balance: string
  date: number
}

export interface IUpdatedHistory {
  [accountId: string]: IUpdatedAssets[]
}

export interface ISockets {
  [accountId: string]: Socket
}

export interface IWalletHistoryResponse {
  success: boolean
  data?: {
    period: string
    wallets: IWallet[]
  }[]
  error?: string
}

export interface IUpdatedAssets {
  assetId: string
  walletIds: string[]
  accountIds: string[]
  newHistory?: {
    from: string
    to: string
    amount: string
    hash: string
    balance: string
    timestamp: number
  }
}
