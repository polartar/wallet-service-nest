export class UpdateShardsDto {
  accountId: string
  serverShard?: string
  accountShard?: string
  iCloudShard?: string
  vaultShard?: string
  passcodeKey?: string
  recoveryKey?: string
}
