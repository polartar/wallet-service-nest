import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'
export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    [EEnvironment.etherscanAPIKey]: process.env.ETHERSCAN_API_KEY,
    [EEnvironment.princessAPIUrl]:
      process.env.PRINCESS_API_URL || 'http://localhost3000',
    [EEnvironment.moralisAPIKey]: process.env.MORALIS_API_KEY,
    [EEnvironment.alchemyGoerliAPIKey]: process.env.ALCHEMY_GOERLI_API_KEY,
    [EEnvironment.alchemyMainnetAPIKey]: process.env.ALCHEMY_MAINNET_API_KEY,
    [EEnvironment.liquidAPIKey]: process.env.LIQUID_API_KEY,
    [EEnvironment.liquidAPIUrl]: process.env.LIQUID_API_URL,
    [EEnvironment.liquidTestAPIKey]: process.env.LIQUID_TEST_API_KEY,
    [EEnvironment.liquidTestAPIUrl]: process.env.LIQUID_TEST_API_URL,
    [EEnvironment.mortyAPIUrl]: process.env.MORTY_API_URL,
    [EEnvironment.webhookMainnetId]: process.env.WEBHOOK_MAINNET_ID,
    [EEnvironment.webhookGoerliId]: process.env.WEBHOOK_GOERLI_ID,
    [EEnvironment.alchemyAuthToken]: process.env.ALCHEMY_AUTH_TOKEN,
    [EEnvironment.cryptoApiKey]: process.env.CRYPTO_API_KEY,
    [EEnvironment.cryptoApiSecretKey]: process.env.CRYPTO_API_SECRET_KEY,
  }

  return env
}
