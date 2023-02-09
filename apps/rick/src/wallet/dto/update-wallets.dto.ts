import { AccountEntity } from '../../account/account.entity'
import { IWalletType } from '../wallet.types'

export class UpdateWalletsDto {
  id: number
  account: AccountEntity
  address: string
  type: IWalletType
  balanceHistory: string
}
