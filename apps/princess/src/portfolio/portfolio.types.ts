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
    cryptoAmount: string
    hash: string
    balance: string
    timestamp: number
  }
}

export interface IWebhookData {
  event: {
    network: string
    activity: []
  }
}
export interface ITransactionWebhookData {
  apiVersion: string
  referenceId: string
  idempotencyKey: string
  data: {
    product: string
    event: string
    item: {
      blockchain: string
      network: string
      address: string
      minedInBlock: {
        height: number
        hash: string
        timestamp: number
      }
      transactionId: string
      amount: string
      unit: string
      direction: string
    }
  }
}
