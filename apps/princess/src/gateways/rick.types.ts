import { EPeriod } from '@rana/core'

export type IRickGetPortfolioHistory = {
  access_token: string
  periods: EPeriod[]
}
