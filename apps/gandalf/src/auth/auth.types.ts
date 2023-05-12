import { EAuth } from '@rana/core'

export type IAuthData = {
  idToken: string
  type: EAuth
  accountId: number
}

export type IAuthResponse = {
  name: string
  email: string
}
