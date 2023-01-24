import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'

export const Environment = () => {
  const env: {
    [key in EEnvironment]: IData
  } = {
    [EEnvironment.appleClientID]: process.env.GOOGLE_CLIENT_ID,
    [EEnvironment.googleClientID]: process.env.APPLE_CLIENT_ID,
  }
  return env
}
