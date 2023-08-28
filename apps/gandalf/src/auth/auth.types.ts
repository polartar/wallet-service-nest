import { EAuth, EPlatform } from '@rana/core'

export type IAuthData = {
  idToken: string
  type: EAuth
  platform: EPlatform
  accountId: string
  accountShard?: string
  iCloudShard?: string
  vaultShard?: string
  passcodeKey?: string
  recoveryKey?: string
  serverShard?: string
  isApple: boolean
}

export type IAuthResponse = {
  name: string
  email: string
}
