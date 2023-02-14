export enum IWalletType {
  ETHEREUM = 'eth',
  BITCOIN = 'btc',
}

export enum EPeriod {
  Day = '1D',
  Week = '1W',
  Month = '1M',
  Months = '6M',
  Year = '1Y',
  All = 'All',
}

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
