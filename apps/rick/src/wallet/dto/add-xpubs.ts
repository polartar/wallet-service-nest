export interface IXPub {
  BIP44: number
  xpub: string
}
export class AddXPubs {
  accountId: number
  xpubs: IXPub[]
}
