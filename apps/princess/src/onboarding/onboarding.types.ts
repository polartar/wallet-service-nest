import { EAuth } from '@rana/core'

export interface IOnboardingSignIn {
  type: EAuth
  access_token: string
  device_id: string
  otp: string
  server_proposed_shard: string
  own_proposed_shard: string
  passcode_key: string
  recovery_key: string
}
export interface IAccount {
  id: string
  email: string
  name: string
}
export interface IOnboardingSigningResponse {
  success: boolean
  data?: {
    type: EOnboardingType
    account_id: string
    account: IAccount
  }
  error?: string
}

export interface IDeviceCreateResponse {
  success: boolean
  data?: {
    otp: string
    device_id: string
  }
  error?: string
}

export interface IDeviceRegisterResponse {
  success: boolean
  data?: {
    account: IAccount
  }
  error?: string
}

export enum EOnboardingType {
  NEW_EMAIL = 'new_email',
  NEW_DEVICE = 'new_device',
  EXISTING_ACCOUNT = 'existing_account',
}
