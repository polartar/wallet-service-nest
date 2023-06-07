export interface IAccount {
  id?: number
  email?: string
  name?: string
}
export interface IOnboardingSigningResponse {
  type: string
  account_id: number
  account: IAccount
  access_token: string
  refresh_token: string
  server_shard: string
  passcode_key: string
  recovery_key: string
}

export interface IDeviceCreateResponse {
  secret: string
  device_id: string
  account_id: number
  access_token: string
  refresh_token: string
}

export interface IDeviceRegisterResponse {
  account: IAccount
}

export interface IAccessTokenPayload {
  accountId: number
  idToken: string
  deviceId: string
  type: string
  otp: string
}
