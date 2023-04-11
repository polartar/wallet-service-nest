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
  server_shard: string
  passcode_key: string
  recovery_key: string
}

export interface IDeviceCreateResponse {
  otp: string
  device_id: string
}

export interface IDeviceRegisterResponse {
  account: IAccount
}
