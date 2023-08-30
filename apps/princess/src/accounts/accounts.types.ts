import { Request } from '@nestjs/common'

export interface IRequest extends Request {
  accountId: string
  deviceId: string
}

export interface IAccount {
  id?: string
  email?: string
  name?: string
}

export interface ICreateAccountResponse {
  id: string
  email: string
  wallets: {
    id: string
    title: string
    xPub: string
    mnemonic: string
    assets: []
  }[]
}

export interface IShard {
  accountShard: string
  iCloudShard: string
  passcodeKey: string
  recoveryKey: string
  serverShard: string
  vaultShard: string
}
