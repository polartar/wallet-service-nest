export class CreatePairingDto {
  userId: number
  deviceId: string
  serverProposedShard: string
  ownProposedShard: string
  passCodeKey: string
  recoveryKey: string
  otp?: string
}
