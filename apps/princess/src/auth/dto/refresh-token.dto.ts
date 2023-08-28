import { ApiProperty } from '@nestjs/swagger'
import { EAuth, EPlatform } from '@rana/core'
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator'

export class RefreshTokenDto {
  @ApiProperty({
    description: 'auth type',
    enum: [EAuth.Apple, EAuth.Google],
  })
  provider: EAuth | 'Anonymous'

  @ApiProperty({
    description: 'platform type',
    enum: [EPlatform.Android, EPlatform.IOS],
    default: EPlatform.Android,
  })
  @IsOptional()
  platform: EPlatform

  @ApiProperty({
    description:
      'token of Google or Apple login. When anonymous, it will be empty',
  })
  @IsOptional()
  providerToken: string

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  @IsUUID(4)
  deviceId: string

  @ApiProperty({ description: 'one time password' })
  @IsNotEmpty()
  otp: string

  @ApiProperty({ description: 'account id' })
  @IsNotEmpty()
  accountId: string
}
