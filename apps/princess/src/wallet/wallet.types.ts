export enum EAPIMethod {
  POST = 'post',
  GET = 'get',
  PATCH = 'patch',
  DELETE = 'delete',
}

export interface ITransaction {
  from: string
  to: string
  balance: string
  amount?: string
  tokenId: number
  timestamp: number
}

// export interface IWallet {
//   id: number
//   assets: IAsset[]
// }

// export interface IAsset {
//   network: ENetworks
//   address: string
//   transactions: {
//     balance: string
//     amount: string
//     timestamp: number
//     usdBalance?: string
//     usdAmount: string
//   }[]
// }
