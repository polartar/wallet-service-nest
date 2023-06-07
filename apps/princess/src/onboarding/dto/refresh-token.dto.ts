import { ApiProperty } from '@nestjs/swagger'
import { EAuth } from '@rana/core'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class RefreshTokenDto {
  @ApiProperty({
    description: 'auth type',
    enum: [EAuth.Apple, EAuth.Google, 'Anonymous'],
  })
  type: EAuth | 'Anonymous'

  @ApiProperty({
    description:
      'token of Google or Apple login. When anonymous, it will be empty',
  })
  id_token: string

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  @IsUUID(4)
  device_id: string

  @ApiProperty({ description: 'one time password' })
  @IsNotEmpty()
  otp: string

  @ApiProperty({ description: 'account id' })
  @IsNotEmpty()
  account_id: number
}
