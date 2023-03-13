import { EPeriod } from '@rana/core'

export class GetWalletHistoryDto {
  accountId: number
  period?: EPeriod
}
