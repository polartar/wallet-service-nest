export class CreateAccountDto {
  email: string
  name: string
  serverShard?: string
  accountShard?: string
  iCloudShard?: string
  vaultShard?: string
  passcodeKey?: string
  recoveryKey?: string
}
