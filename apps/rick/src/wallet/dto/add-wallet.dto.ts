import { EWalletType } from '@rana/core'
import { AccountEntity } from '../../account/account.entity'

export class AddWalletDto {
  account: AccountEntity
  xPub: string
  walletType: EWalletType
}
