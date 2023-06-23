export enum ExPubTypes {
  BIP44 = 'bip44',
  BIPT66 = 'bip66',
}
export interface IXPub {
  type: ExPubTypes
  xpub: string
}
export class AddXPubs {
  title: string
  accountId: number
  xpubs: IXPub[]
}
