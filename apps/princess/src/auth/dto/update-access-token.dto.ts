import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateAccessTokenDto {
  @ApiProperty({ description: 'account id' })
  @IsNotEmpty()
  accountId: string

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  @IsUUID(4)
  deviceId: string

  @ApiProperty({ description: 'refresh token' })
  @IsNotEmpty()
  refreshToken: string

  @ApiProperty({ description: 'one time password or secret' })
  @IsNotEmpty()
  otp: string
}
