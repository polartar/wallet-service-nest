import { ApiProperty } from '@nestjs/swagger'
import { EAuth } from '@rana/core'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class SignInDto {
  @ApiProperty({
    description: 'auth type',
    enum: [EAuth.Apple, EAuth.Google],
  })
  type: EAuth

  @ApiProperty({ description: 'token of Google or Apple login' })
  @IsNotEmpty()
  id_token: string

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  @IsUUID(4)
  device_id: string

  @ApiProperty({ description: 'one time password' })
  @IsNotEmpty()
  otp: string

  @ApiProperty({ description: 'server shard' })
  @IsNotEmpty()
  server_proposed_shard: string

  @ApiProperty({ description: 'own shard' })
  @IsNotEmpty()
  own_proposed_shard: string

  @ApiProperty({ description: 'pass key' })
  @IsNotEmpty()
  passcode_key: string

  @ApiProperty({ description: 'recovery code' })
  @IsNotEmpty()
  recovery_key: string
}
