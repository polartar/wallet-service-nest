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

export enum ICoinType {
  ETHEREUM = 'eth',
  BITCOIN = 'btc',
}

export enum IWalletType {
  HOTWALLET = 'hotwallet',
  VAULT = 'vault',
  METAMASK = 'metamask',
}

export enum EPortfolioType {
  NFT = 'nft',
  TRANSACTION = 'transaction',
}
