export interface INFTAssetResponse {
  success: boolean
  data?: INFTInfo[]
  error?: string
}

interface INFTInfo {
  contract: {
    address: string
    name: string
    symbol: string
    totalSupply: string
    tokenType: string
    openSea: {
      lastIngestedAt: Date
    }
    contractDeployer: string
    deployedBlockNumber: number
  }
  tokenId: number
  tokenType: string
  title: string
  description: string
  balance: number
}
