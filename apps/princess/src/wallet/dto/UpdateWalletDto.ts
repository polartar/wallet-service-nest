import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class UpdateWalletDto {
  @ApiProperty({ description: 'The title of the wallet' })
  @IsOptional()
  title: string

  @ApiProperty({ description: 'The mnemonic of the wallet' })
  @IsOptional()
  mnemonic: string
}
