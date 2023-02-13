import { WalletEntity } from '../wallet.entity'

export class AddRecordDto {
  wallet: WalletEntity
  balance: string
  timestamp: number
}
