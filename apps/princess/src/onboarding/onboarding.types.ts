import { EAuth } from '@rana/core'

export interface IOnboardingSignIn {
  type: EAuth
  token: string
  deviceId: string
}

export interface IOnboardingSigningResponse {
  success: boolean
  data?: {
    type: EOnboardingType
    id: string
    account: {
      id: string
      email: string
      name: string
    }
  }
  error?: string
}

export interface IOnboardingDeviceResponse {
  success: boolean
  data?: {
    otp: string
    id: string
    isNew: boolean
  }
  error?: string
}

export enum EOnboardingType {
  NEW_EMAIL = 'new_email',
  NEW_DEVICE = 'new_device',
  EXISTING_ACCOUNT = 'existing_account',
}
