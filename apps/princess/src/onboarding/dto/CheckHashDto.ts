import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class CheckHashDto {
  @ApiProperty({ description: 'account id' })
  @IsNotEmpty()
  @IsNumber()
  account_id: number

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  device_id: string

  @ApiProperty({ description: 'hash that represents account object' })
  @IsNotEmpty()
  account_hash: string

  @ApiProperty({ description: 'one time password' })
  @IsNotEmpty()
  otp: string
}
