import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
export class CreateAccountDto {
  @ApiProperty({ description: 'email of user' })
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: 'name of user' })
  @IsNotEmpty()
  name: string
}
