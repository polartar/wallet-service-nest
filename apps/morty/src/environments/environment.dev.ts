import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'
export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    coin_market_api: process.env.COINMARKET_API_KEY,
    production: false,
  }
  return env
}
