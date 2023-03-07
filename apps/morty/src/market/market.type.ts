export enum ICoinType {
  ETHEREUM = 'ethereum',
  BITCOIN = 'bitcoin',
}
export enum IDuration {
  DAY = '1day',
  WEEK = '1week',
  MONTH = '1month',
  MONTHS = '6months',
  YEAR = '1year',
  All = 'all',
}

export interface IResponse {
  success: boolean
  data?: unknown
  error?: string
}
