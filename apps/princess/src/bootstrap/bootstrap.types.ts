export interface IDeviceCreateResponse {
  otpSecret: string
  id: string
  accountId: string
  accessToken: string
  refreshToken: string
}

export interface IAccessTokenPayload {
  accountId: string
  deviceId: string
  type: string
}

export interface IGetInfoResponse {
  minAppVersion: string
  latestAppVersion: string
  serverVersion: string
  self?: {
    rick: string
  }
  '3rdParty'?: {
    'blockcypher.com': string
    'etherscan.io': string
  }
}
