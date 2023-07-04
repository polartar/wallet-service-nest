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
}

export interface IGetInfoResponse {
  minAppVersion: string
  latestAppVersion: string
  serverVersion: string
  self?: {
    rick: string
    morty: string
  }
  '3rdParty'?: {
    'blockcypher.com': string
    'etherscan.io': string
  }
}
