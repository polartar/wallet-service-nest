import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'
export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    [EEnvironment.infuraAPIKey]: process.env.INFURA_API_KEY,
    [EEnvironment.etherscanAPIKey]: process.env.ETHERSCAN_API_KEY,
    [EEnvironment.isProduction]: process.env.NODE_ENV === 'production',
    [EEnvironment.princessAPIUrl]:
      process.env.PRINCESS_API_URL || 'http://localhost3000',
    [EEnvironment.alchemyAPIKey]: process.env.ALCHEMY_API_KEY, // Please remember that the mainnet key and testnet key are different in Alchemy
  }

  return env
}
