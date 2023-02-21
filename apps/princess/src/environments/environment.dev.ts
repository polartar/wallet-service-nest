import { EEnvironment } from './environment.types'

import { IData } from '@rana/core'

export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    infura_api_key: process.env.INFURA_API_KEY,
    rick_api_url: process.env.RICK_API_URL,
  }
  return env
}
