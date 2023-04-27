import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'
export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    [EEnvironment.etherscanAPIKey]: process.env.ETHERSCAN_API_KEY,
    [EEnvironment.isProduction]: process.env.NODE_ENV === 'production',
    [EEnvironment.princessAPIUrl]:
      process.env.PRINCESS_API_URL || 'http://localhost3000',
    [EEnvironment.moralisAPIKey]: process.env.MORALIS_API_KEY,
    [EEnvironment.alchemyAPIKey]: process.env.ALCHEMY_API_KEY,
  }

  return env
}
