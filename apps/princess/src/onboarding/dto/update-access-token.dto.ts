import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator'

export class UpdateAccessTokenDto {
  @ApiProperty({ description: 'account id' })
  @IsNotEmpty()
  @IsNumber()
  account_id: number

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  @IsUUID(4)
  device_id: string

  @ApiProperty({ description: 'refresh token' })
  @IsNotEmpty()
  refresh_token: string

  @ApiProperty({ description: 'one time password or secret' })
  @IsNotEmpty()
  otp: string
}
