import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
export class SwitchToCloudShardDto {
  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  device_id: string
}

export class SwitchCloudSwaggerResponse {
  @ApiProperty({
    example: 1,
  })
  userId: number

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

export class SwitchWalletSwaggerResponse {
  @ApiProperty({
    example: 1,
  })
  userId: number

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
    example: false,
  })
  isCloud: boolean
}
