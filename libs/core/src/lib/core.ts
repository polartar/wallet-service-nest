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

export enum ECoinTypes {
  ETHEREUM = 'eth',
  BITCOIN = 'btc',
}

export enum ENetworks {
  ETHEREUM = 'eth_mainnet',
  BITCOIN = 'btc_mainnet',
  BITCOIN_TEST = 'btc_testnet3',
  ETHEREUM_TEST = 'eth_goerli',
}

export enum EWalletType {
  HOTWALLET = 'hot_wallet',
  VAULT = 'vault',
  LOCALWALLET = 'local_wallet',
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

export enum EXPubCurrency {
  ETHEREUM = 'ethereum.secp256k1',
  BITCOIN = 'segwit.bitcoin.secp256k1',
}
