import { EAuth, EFlavor, EPlatform } from '@rana/core'

export type IAuthData = {
  idToken: string
  type: EAuth
  flavor: EFlavor
  platform: EPlatform
  accountId: string
  accountShard?: string
  iCloudShard?: string
  vaultShard?: string
  passcodeKey?: string
  recoveryKey?: string
  serverShard?: string
  googleDriveShard?: string
}

export type IAuthResponse = {
  name: string
  email: string
}
