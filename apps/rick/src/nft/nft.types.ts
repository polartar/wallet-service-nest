export interface INTAssetInput {
  address: string
  page?: number
}
export interface INFTAssetResponse {
  total: number
  pageNumber: number
  hasNextPage: boolean
  countPerPage: number
  nfts: INFTInfo[]
}

export interface INFTInfo {
  token_address: string
  token_id: string
  contract_type: string
  owner_of: string
  block_number: string
  block_number_minted: string
  token_uri?: string
  metadata?: string
  last_metadata_sync?: string | number
  last_token_uri_sync?: string | number
}
