import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'
export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    [EEnvironment.isProduction]: process.env.NODE_ENV === 'production',
    [EEnvironment.liquidAPIKey]: process.env.LIQUID_API_KEY,
    [EEnvironment.princessAPIUrl]:
      process.env.PRINCESS_API_URL || 'http://localhost3000',
  }

  return env
}
