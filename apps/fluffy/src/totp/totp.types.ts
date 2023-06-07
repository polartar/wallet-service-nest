export interface IPair {
  userId: number
  deviceId: string
  otp?: string
  serverProposedShard?: string
  ownProposedShard?: string
  passCodeKey?: string
  recoveryKey?: string
}

export interface IDeviceUpdate {
  passCodeKey?: string
  isCloud?: boolean
}
