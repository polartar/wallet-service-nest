import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { ECoinType } from '@rana/core'

export class NewsTopDto {
  @ApiProperty({ description: 'news count per page', required: false })
  @IsOptional()
  count: number

  @ApiProperty({
    description: 'symbol type',
    enum: [ECoinType.BITCOIN, ECoinType.ETHEREUM],
    required: false,
  })
  @IsOptional()
  symbol: ECoinType
}
