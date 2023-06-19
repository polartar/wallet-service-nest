export type IData =
  | string
  | boolean
  | number
  | null
  | {
      [key: string]: IData
    }

export enum EPeriod {
  Day = '1D',
  Week = '1W',
  Month = '1M',
  Months = '6M',
  Year = '1Y',
  All = 'All',
}

export enum ECoinType {
  ETHEREUM = 'eth',
  BITCOIN = 'btc',
}

export enum EWalletType {
  HOTWALLET = 'hotwallet',
  VAULT = 'vault',
  METAMASK = 'metamask',
}

export enum EPortfolioType {
  NFT = 'nft',
  TRANSACTION = 'transaction',
}
export enum EAuth {
  Google = 'google',
  Apple = 'apple',
}

export function getTimestamp(date?: string): number {
  return date
    ? Math.floor(new Date(date).getTime() / 1000)
    : Math.floor(new Date().getTime() / 1000)
}

export enum ENetworks {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}
