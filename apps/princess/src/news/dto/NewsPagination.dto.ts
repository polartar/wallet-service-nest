import { ApiProperty } from '@nestjs/swagger'
import { ESort } from '../news.types'
import { IsOptional } from 'class-validator'
import { ECoinType } from '@rana/core'

export class NewsPaginationDto {
  @ApiProperty({
    description: 'sort type',
    enum: [ESort.ASC, ESort.DESC],
    required: false,
  })
  @IsOptional()
  sort: ESort

  @ApiProperty({ description: 'news count per page', required: false })
  @IsOptional()
  countPerPage: number

  @ApiProperty({ description: 'current page number', required: false })
  @IsOptional()
  pageNumber: number

  @ApiProperty({ description: 'start time', required: false })
  @IsOptional()
  startTime: Date

  @ApiProperty({ description: 'end time', required: false })
  endTime: Date

  @ApiProperty({
    description: 'symbol type',
    enum: [ECoinType.BITCOIN, ECoinType.ETHEREUM],
    required: false,
  })
  @IsOptional()
  symbol: ECoinType
}
