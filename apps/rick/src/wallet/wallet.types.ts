import { EPeriod } from '@rana/core'

export const SecondsIn: {
  [key in EPeriod]: number | null
} = {
  [EPeriod.Day]: 3600 * 24,
  [EPeriod.Week]: 3600 * 24 * 7,
  [EPeriod.Month]: 3600 * 24 * 30,
  [EPeriod.Months]: 3600 * 24 * 30,
  [EPeriod.Year]: 3600 * 24 * 365,
  [EPeriod.All]: null,
}

export enum ETransactionStatuses {
  RECEIVED = 'received',
  SENT = 'sent',
  RECEIVING = 'receiving',
  FAILED = 'failed',
  SENDING = 'sending',
  INTERNAL = 'internal',
}
