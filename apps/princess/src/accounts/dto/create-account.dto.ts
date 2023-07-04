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
