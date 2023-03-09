import { EPeriod } from './../wallet.types'
export class GetWalletHistoryDto {
  accountId: number
  period?: EPeriod
}
