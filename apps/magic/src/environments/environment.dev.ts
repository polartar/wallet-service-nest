import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'
export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    [EEnvironment.mortyAPIUrl]: process.env.MORTY_API_URL,
    [EEnvironment.infuraAPIKey]: process.env.INFURA_API_KEY,
    [EEnvironment.moralisAPIKey]: process.env.MORALIS_API_KEY,
  }

  return env
}
