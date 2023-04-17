import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
export class UpdatePassCodeDto {
  @ApiProperty({ description: 'pass code' })
  @IsNotEmpty()
  passcode_key: string

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  device_id: string
}
