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
interface ERC1155Metadata {
  tokenId: string
  value: string
}
export interface IBlockchainTransaction {
  fromAddress: string
  toAddress: string
  value: number
  hash: string
  blockNum: BigNumber
  asset: string
  category: string
  erc721TokenId?: string
  erc1155Metadata?: ERC1155Metadata[]
  rawContract?: {
    address: string
  }
}

export interface INFTInfo {
  token_address: string
  token_id: string
  contract_type: string
  owner_of?: string
  block_number?: string
  token_uri?: string
  metadata?: string
  token_hash?: string
  last_metadata_sync?: string | number
  last_token_uri_sync?: string | number
  amount?: string
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
