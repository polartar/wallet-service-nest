import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'
export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    infura_api_key: process.env.INFURA_API_KEY,
    production: false,
  }
  return env
}
