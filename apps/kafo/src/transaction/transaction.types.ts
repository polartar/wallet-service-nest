export interface ITransactionInput {
  from: string
  to: string
  amount: number
  coinType: ICoinType
}

export enum ICoinType {
  BITCOIN = 'btc',
  ETHEREUM = 'eth',
}
export interface ITransactionPush {
  transaction: string
  coinType: ICoinType
}

export interface IFeeResponse {
  high_fee_per_kb: number
  medium_fee_per_kb: number
  low_fee_per_kb: number
}
