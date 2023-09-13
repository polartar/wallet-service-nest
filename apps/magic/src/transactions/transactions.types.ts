// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AssetEntity } from 'apps/rick/src/wallet/asset.entity'
import { BigNumber } from 'ethers'

export enum ETransactionStatuses {
  RECEIVED = 'received',
  SENT = 'sent',
  RECEIVING = 'receiving',
  FAILED = 'failed',
  SENDING = 'sending',
  INTERNAL = 'internal',
}

export interface IWebhookData {
  event: {
    network: string
    activity: IBlockchainTransaction[]
  }
}
export interface IBlockchainTransaction {
  fromAddress: string
  toAddress: string
  value: number
  hash: string
  blockNum: BigNumber
}
export interface ITransaction {
  asset: AssetEntity
  balance: string
  usdPrice: string
  from: string
  to: string
  cryptoAmount?: string
  fiatAmount?: string
  tokenId?: number
  hash: string
  timestamp: number
  status: ETransactionStatuses
  fee: string
  blockNumber?: number
}
