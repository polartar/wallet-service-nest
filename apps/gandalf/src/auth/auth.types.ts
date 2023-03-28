import { EAuth } from '@rana/core'

export type IAuthData = {
  idToken: string
  type: EAuth
}

export type IAuthResponse = {
  name: string
  email: string
}
