export const environment = {
  production: false,
}
import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'

export const Environment = () => {
  const env: {
    [key in EEnvironment]: IData
  } = {
    [EEnvironment.payloadPrivateKey]: process.env.PAYLOAD_VERIFICATION_RSA,
    [EEnvironment.liquidAPIKey]: process.env.LIQUID_API_KEY,
    [EEnvironment.liquidTestAPIKey]: process.env.LIQUID_TEST_API_KEY,
    [EEnvironment.liquidAPIUrl]: process.env.LIQUID_API_URL,
    [EEnvironment.liquidTestAPIUrl]: process.env.LIQUID_TEST_API_URL,
  }
  return env
}
