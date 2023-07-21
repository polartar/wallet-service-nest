import { ApiProperty } from '@nestjs/swagger'

export class UpdateShardsDto {
  @ApiProperty({
    example: 'server shard',
  })
  serverShard: string

  @ApiProperty({
    example: 'account shard',
  })
  accountShard: string

  @ApiProperty({
    example: 'iCloud shard',
  })
  iCloudShard: string

  @ApiProperty({
    example: 'vault shard',
  })
  vaultShard: string

  @ApiProperty({
    example: 'passcode key',
  })
  passcodeKey: string

  @ApiProperty({
    example: 'recovery key',
  })
  recoveryKey: string
}
