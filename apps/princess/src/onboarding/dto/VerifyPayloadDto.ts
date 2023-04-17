import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty } from 'class-validator'

export interface IEncodeData {
  part: string
  message: string
}
export class VerifyPayloadDto {
  @ApiProperty({ description: 'encoded value array' })
  @IsNotEmpty()
  @IsArray()
  data: IEncodeData[]
}
