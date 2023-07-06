import { Request } from '@nestjs/common'
import { ENetworks } from '@rana/core'

export interface IRequest extends Request {
  accountId: string
  deviceId: string
}

export interface IWallet {
  id: string
  title: string
  addresses: IAddress[]
}

export interface IAddress {
  coinType: ENetworks
  address: string
  history: {
    balance: string
    amount: string
    timestamp: number
    usdBalance?: string
    usdAmount: string
  }[]
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

export interface IDeviceOptionalParams {
  accountShard: string
  iCloudshard: string
  passcodeKey: string
  recoveryKey: string
  serverShard: string
  vaultShard: string
}
