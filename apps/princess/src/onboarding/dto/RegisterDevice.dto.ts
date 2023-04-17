import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class RegisterDeviceDto {
  @ApiProperty({ description: 'account Id' })
  @IsNotEmpty()
  @IsNumber()
  account_id: number

  @ApiProperty({ description: 'one time password' })
  @IsNotEmpty()
  otp: string
}
