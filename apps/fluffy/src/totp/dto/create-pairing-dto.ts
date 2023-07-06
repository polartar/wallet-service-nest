export class CreatePairingDto {
  userId: string
  deviceId: string
  otp?: string
  serverShard?: string
  accountShard?: string
  iCloudshard?: string
  vaultShard?: string
  passcodeKey?: string
  recoveryKey?: string
}
