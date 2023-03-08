import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'
export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    [EEnvironment.coinMarketAPI]: process.env.COINMARKET_API_KEY,
    [EEnvironment.isProduction]: process.env.NODE_ENV === 'production',
    [EEnvironment.fidelityClientId]: process.env.FIDELITY_CLIENT_ID,
    [EEnvironment.fidelityClientSecret]: process.env.FIDELITY_CLIENT_SECRET,
  }
  return env
}
