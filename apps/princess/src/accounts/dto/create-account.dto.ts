import { ApiProperty } from '@nestjs/swagger'
import { EAuth } from '@rana/core'
import { IsNotEmpty } from 'class-validator'
export class CreateAccountDto {
  @ApiProperty({
    description: 'auth provider',
    enum: [EAuth.Apple, EAuth.Google],
  })
  provider: EAuth

  @ApiProperty({ description: 'token of Google or Apple login' })
  @IsNotEmpty()
  providerToken: string

  @ApiProperty({ description: 'one time password' })
  @IsNotEmpty()
  otp: string

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

export class AccountSwaggerResponse {
  @ApiProperty({
    example: 'test@gmail.com',
  })
  email: string

  @ApiProperty({
    example: 'Michael',
  })
  name: string
}
