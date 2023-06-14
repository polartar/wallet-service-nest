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
    [EEnvironment.isProduction]: process.env['NODE' + '_ENV'] === 'production',
    [EEnvironment.infuraAPIKey]: process.env.INFURA_API_KEY,
    [EEnvironment.payloadPrivateKey]: process.env.PAYLOAD_VERIFICATION_RSA,
    [EEnvironment.liquidAPIKey]: process.env.LIQUID_API_KEY,
    [EEnvironment.liquidAPIUrl]: process.env.LIQUID_API_URL,
  }
  return env
}
