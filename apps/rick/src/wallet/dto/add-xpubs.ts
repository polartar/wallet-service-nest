export interface IVaultCoin {
  BIP44: number
  wallets: {
    accounts: {
      address: string
      hidden: boolean
      index: number
      publickey: string
    }[]
    wallet_index: number
    xpub: string
  }[]
}
export class AddXPubs {
  title: string
  accountId: string
  coins: IVaultCoin[]
}
