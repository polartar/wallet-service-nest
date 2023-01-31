export enum IWalletType {
  ETHEREUM = 'eth',
  BITCOIN = 'btc',
}

export interface IWallet {
  address: string
  type: IWalletType
  balance: string
}
