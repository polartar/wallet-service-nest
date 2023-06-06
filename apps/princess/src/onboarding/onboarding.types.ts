export interface IAccount {
  id: string
  email: string
  name: string
}
export interface IOnboardingSigningResponse {
  type: string
  account_id: string
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
  accountId: string
  idToken: string
  deviceId: string
  type: string
}
