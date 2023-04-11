import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator'

export class SyncUserDto {
  @ApiProperty({ description: 'account id' })
  @IsNotEmpty()
  @IsNumber()
  account_id: number

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  @IsUUID(4)
  device_id: string

  @ApiProperty({ description: 'hash that represents account object' })
  @IsNotEmpty()
  account_hash: string

  @ApiProperty({ description: 'one time password' })
  @IsNotEmpty()
  otp: string
}
