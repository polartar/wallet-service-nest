export class CreatePairingDto {
  userId: string
  deviceId: string
  otp?: string
  serverShard?: string
  accountShard?: string
  iCloudShard?: string
  vaultShard?: string
  passcodeKey?: string
  recoveryKey?: string
}
