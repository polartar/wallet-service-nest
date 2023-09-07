import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'

export const Environment = () => {
  const env: {
    [key in EEnvironment]: IData
  } = {
    [EEnvironment.googleClientID]: process.env.GOOGLE_CLIENT_ID,
    [EEnvironment.IOSGoogleClientID]: process.env.IOS_GOOGLE_CLIENT_ID,
    [EEnvironment.appleClientID]: process.env.APPLE_CLIENT_ID,
    [EEnvironment.appleClientIDGreens]: process.env.GREENS_APPLE_CLIENT_ID,
  }
  return env
}
