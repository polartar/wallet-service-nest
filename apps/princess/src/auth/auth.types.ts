export interface IAccount {
  id?: string
  email?: string
  name?: string
}

export interface IDeviceRegisterResponse {
  account: IAccount
}
