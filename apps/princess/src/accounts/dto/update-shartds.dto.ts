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
  iCloudshard: string

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

export class UpdatePassCodeSwaggerResponse {
  @ApiProperty({
    example: '910f5dbe-d8dc-4480-8e3b-9ea9b1b8cf87',
  })
  userId: string

  @ApiProperty({
    example: 'daa47873-3eb4-4635-9ce2-8cf0992b67e6',
  })
  deviceId: string

  @ApiProperty({
    example: 'secret',
  })
  secret: string

  @ApiProperty({
    example: 'server shard',
  })
  serverProposedShard: string

  @ApiProperty({
    example: 'own shard',
  })
  ownProposedShard: string

  @ApiProperty({
    example: 'passcode',
  })
  passCodeKey: string

  @ApiProperty({
    example: 'recovery key',
  })
  recoveryKey: string

  @ApiProperty({
    example: true,
  })
  isCloud: boolean
}
