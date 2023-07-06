export interface IVaultCoin {
  BIP44: number
  wallets: {
    address: string
    hidden: boolean
    index: number
    publickey: string
  }[]
}
export class AddXPubs {
  title: string
  accountId: string
  coins: IVaultCoin[]
}
