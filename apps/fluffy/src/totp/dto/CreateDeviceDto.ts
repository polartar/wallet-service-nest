export class CreateDeviceDto {
  userId: string
  deviceId: string
  serverProposedShard: string
  ownProposedShard: string
  passCodeKey: string
  recoveryKey: string
  otp?: string
}
