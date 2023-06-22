import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class UpdateWalletDto {
  @ApiProperty({ description: 'Active status of the wallet' })
  @IsNotEmpty()
  is_active: boolean
}
