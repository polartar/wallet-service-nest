export enum IWalletType {
  XPUB = 'xpub',
  METAMASK = 'metamask',
  LEDGER = 'ledger',
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
