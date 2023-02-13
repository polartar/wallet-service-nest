export type IRickSocketData = {
  accountId: number
  period: IPortfolioDuration
}
export enum IPortfolioDuration {
  DAY = '1d',
  WEEK = '1w',
  MONTH = '1m',
  MONTHs = '6m',
  YEAR = '1y',
  ALL = 'all',
}
