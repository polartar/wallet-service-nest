import { IWalletType } from '@rana/core'
import { AccountEntity } from '../../account/account.entity'

export class UpdateWalletsDto {
  id: number
  account: AccountEntity
  address: string
  type: IWalletType
  balanceHistory: string
}
