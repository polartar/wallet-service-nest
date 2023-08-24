import { ApiProperty } from '@nestjs/swagger'

export class DeleteAccountDto {
  @ApiProperty({
    example: 'otp',
    required: true,
  })
  otp: string
}
