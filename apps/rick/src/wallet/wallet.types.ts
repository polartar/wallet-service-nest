export enum IWalletType {
  ETHEREUM = 'eth',
  BITCOIN = 'btc',
}

export interface IWallet {
  id?: number
  address: string
  type: IWalletType
  balance: string
}

export interface IBalanceData {
  ids: number[]
  balances: string[]
}
