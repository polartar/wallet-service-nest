import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class AddAssetDto {
  @ApiProperty({ description: 'The id of asset' })
  @IsNotEmpty()
  assetId: string
}
