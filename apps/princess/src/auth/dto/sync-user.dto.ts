import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator'

export class SyncUserDto {
  @ApiProperty({ description: 'account id' })
  @IsNotEmpty()
  @IsNumber()
  accountId: string

  @ApiProperty({ description: 'device id' })
  @IsNotEmpty()
  @IsUUID(4)
  deviceId: string

  @ApiProperty({ description: 'hash that represents account object' })
  @IsNotEmpty()
  accountHash: string

  @ApiProperty({ description: 'one time password' })
  @IsNotEmpty()
  otp: string
}

export class SyncUserSwaggerResponse {
  @ApiProperty({
    example: true,
  })
  isSync: boolean

  @ApiProperty({
    example: {
      name: 'Michael',
      email: 'test@gmail.com',
      id: 1,
    },
  })
  account: string
}
