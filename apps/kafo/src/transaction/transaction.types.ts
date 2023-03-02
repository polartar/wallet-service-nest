export interface ITransactionResponse {
  status: boolean
  data?: any
}
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
