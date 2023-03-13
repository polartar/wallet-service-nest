import { AccountEntity } from '../../account/account.entity'
import { IWalletType } from '../wallet.types'

export class AddWalletDto {
  account: AccountEntity
  xPub: string
  walletType: IWalletType
}
