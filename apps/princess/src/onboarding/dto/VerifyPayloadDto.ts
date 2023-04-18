import { ApiProperty } from '@nestjs/swagger'
export class VerifyPayloadDto {
  @ApiProperty({ description: 'part of encoded message' })
  part: string

  @ApiProperty({ description: 'original message' })
  message: string
}
