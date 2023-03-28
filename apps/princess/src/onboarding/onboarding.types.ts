import { EAuth } from '@rana/core'

export interface IOnboardingSignIn {
  type: EAuth
  token: string
}

export interface IOnboardingSigninResponse {
  success: boolean
  data?: {
    otp: string
    id: string
  }
  error?: string
}
