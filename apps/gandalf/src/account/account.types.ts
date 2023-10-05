export type IAccountUpdate = {
  name: string
  email: string
  accountShard?: string
  iCloudShard?: string
  vaultShard?: string
  passcodeKey?: string
  recoveryKey?: string
  serverShard?: string
  googleDriveShard?: string
}

export interface IShard {
  accountShard: string
  iCloudShard: string
  passcodeKey: string
  recoveryKey: string
  serverShard: string
  vaultShard: string
  googleDriveShard: string
}
