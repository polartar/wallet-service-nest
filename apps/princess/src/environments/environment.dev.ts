import { IData } from '@rana/core'

import { EEnvironment } from './environment.types'
export const Environment = () => {
  const env: { [key in EEnvironment]: IData } = {
    [EEnvironment.fidelityClientId]: process.env.FIDELITY_CLIENT_ID,
    [EEnvironment.fidelityClientSecret]: process.env.FIDELITY_CLIENT_SECRET,
    [EEnvironment.rickAPIUrl]:
      process.env.RICK_API_URL || 'http://localhost:3333',
    [EEnvironment.mortyAPIUrl]:
      process.env.MORTY_API_URL || 'http://localhost:3333',
    [EEnvironment.gandalfAPIUrl]:
      process.env.GANDALF_API_URL || 'http://localhost:3333',
    [EEnvironment.fluffyAPIUrl]:
      process.env.FLUFFY_API_URL || 'http://localhost:3333',
    [EEnvironment.kafoAPIUrl]:
      process.env.KAFO_API_URL || 'http://localhost:3333',
    [EEnvironment.magicAPIUrl]:
      process.env.MAGIC_API_URL || 'http://localhost:3337',
    [EEnvironment.version]: process.env.VERSION || '1.0',
    [EEnvironment.bristleAPIUrl]:
      process.env.BRISTLE_API_URL || 'http://localhost:3333',
    [EEnvironment.jwtRefreshTokenSecret]: process.env.JWT_REFRESH_TOKEN_SECRET,
    [EEnvironment.alchemySigningKey]: process.env.ALCHEMY_SIGNING_KEY,
  }
  return env
}
