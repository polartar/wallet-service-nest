import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'
export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    infura_api_key: process.env.INFURA_API_KEY,
    etherscan_api_key: process.env.ETHERSCAN_API_KEY,
    is_production: process.env.NODE_ENV === 'production',
    princess_api_url: process.env.PRINCESS_API_URL || 'http://localhost3000',
  }
  return env
}
