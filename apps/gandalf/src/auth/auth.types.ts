import { EAuth } from '@rana/core'

export type IAuthData = {
  idToken: string
  type: EAuth
  accountId: string
  accountShard?: string
  iCloudShard?: string
  vaultShard?: string
  passcodeKey?: string
  recoveryKey?: string
  serverShard?: string
}

export type IAuthResponse = {
  name: string
  email: string
}
