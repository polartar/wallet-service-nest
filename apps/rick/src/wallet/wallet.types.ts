import { EPeriod } from '@rana/core'

export const SecondsIn: {
  [key in EPeriod]: number | null
} = {
  [EPeriod.Day]: 3600 * 24,
  [EPeriod.Week]: 3600 * 24 * 7,
  [EPeriod.Month]: 3600 * 24 * 30,
  [EPeriod.Months]: 3600 * 24 * 30,
  [EPeriod.Year]: 3600 * 24 * 365,
  [EPeriod.All]: null,
}

export enum IAddressPath {
  BTC = 'm/44/0/0/0/1',
  ETH = 'm/44/60/0/0/5',
}

export interface IBTCTransactionResponse {
  balance: number
  txrefs: IBTCTransaction[]
}

export interface IBTCTransaction {
  tx_hash: string
  block_height: number
  tx_input_n: number
  tx_output_n: number
  value: number
  spent?: boolean
  ref_balance: number
  confirmations: number
  confirmed: string
}

// export interface IXPubInfo {
//   path: string
//   address: string
//   publickey: string
//   index: 0
// }

export enum EXPubCurrency {
  ETHEREUM = 'ethereumclassic.secp256k1',
  BITCOIN = 'segwit.bitcoin.secp256k1',
}

export enum ETransactionStatuses {
  RECEIVED = 'received',
  SENT = 'sent',
  RECEIVING = 'receiving',
  FAILED = 'failed',
  SENDING = 'sending',
}
