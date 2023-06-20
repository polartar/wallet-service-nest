export interface IDeviceCreateResponse {
  otpSecret: string
  id: string
  accountId: number
  accessToken: string
  refreshToken: string
}

export interface IAccessTokenPayload {
  accountId: number
  idToken: string
  deviceId: string
  type: string
  otp: string
}
