export enum IWalletType {
  ETHEREUM = 'eth',
  BITCOIN = 'btc',
}

export interface IWallet {
  id?: number
  address: string
  type: IWalletType
  balanceHistory: string
  isActive?: boolean
}

export interface IBalanceHistory {
  balance: string
  date: Date
}