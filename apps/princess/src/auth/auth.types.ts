export interface IAccount {
  id?: number
  email?: string
  name?: string
}

export interface IDeviceRegisterResponse {
  account: IAccount
}
