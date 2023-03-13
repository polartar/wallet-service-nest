export const environment = {
  production: false,
}
import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'

export const Environment = () => {
  const env: {
    [key in EEnvironment]: IData
  } = {
    [EEnvironment.blockcypherToken]: process.env.BLOCKCYPHER_TOKEN,
    [EEnvironment.isProduction]: process.env.NODE_ENV === 'production',
  }
  return env
}
