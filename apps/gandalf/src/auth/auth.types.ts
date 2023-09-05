import { EAuth, EFlavor, EPlatform } from '@rana/core'

export type IAuthData = {
  idToken: string
  type: EAuth
  flavor: EFlavor
  platform: EPlatform
  accountId: string
  deviceId: string
  otp: string
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
