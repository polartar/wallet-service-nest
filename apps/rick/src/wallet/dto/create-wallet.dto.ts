import { EWalletType } from '@rana/core'

export class CreateWalletDto {
  accountId: number
  title: string
  walletType: EWalletType
  mnemonic: string
  assetIds: number[]
}
