import { ApiProperty } from '@nestjs/swagger'
import { ESort } from '../news.types'
import { IsOptional } from 'class-validator'
import { ECoinTypes } from '@rana/core'

export class NewsPaginationDto {
  @ApiProperty({
    description: 'sort type',
    enum: [ESort.ASC, ESort.DESC],
    required: false,
  })
  @IsOptional()
  sort?: ESort

  @ApiProperty({ description: 'news count per page', required: false })
  @IsOptional()
  'count-per-page'?: number

  @ApiProperty({ description: 'current page number', required: false })
  @IsOptional()
  'page-number'?: number

  @ApiProperty({ description: 'start time', required: false })
  @IsOptional()
  'start-time'?: Date

  @ApiProperty({ description: 'end time', required: false })
  'end-time'?: Date

  @ApiProperty({
    description: 'coin type',
    enum: [ECoinTypes.BITCOIN, ECoinTypes.ETHEREUM],
    required: false,
  })
  @IsOptional()
  coin?: ECoinTypes

  @ApiProperty({ description: 'highlights news', required: false })
  @IsOptional()
  highlights?: number
}

export class PaginationNewsSwaggerResponse {
  @ApiProperty({
    example: [
      {
        pubDateUtc: 1684256400,
        title:
          'OP Erigon released as new client software for Optimism on testnet',
        author: 'Vishal Chawla',
        source: 'theblock',
        description:
          "Optimism contributors emphasize that multiple clients can help prevent a single point of failure, bolstering the network's resilience.",
        link: 'https://www.theblock.co/post/227593/optimism-client-op-erigon-released?utm_source=fidelity&utm_medium=rss',
        textCleaned: 'Test in',
        assetList: ['ETH'],
      },
      {
        pubDateUtc: 1684266400,
        title:
          'OP Erigon released as new client software for Optimism on testnet',
        author: 'Vishal Chawla',
        source: 'theblock',
        description:
          "Optimism contributors emphasize that multiple clients can help prevent a single point of failure, bolstering the network's resilience.",
        link: 'https://www.theblock.co/post/227593/optimism-client-op-erigon-released?utm_source=fidelity&utm_medium=rss',
        textCleaned: 'Test in',
        assetList: ['ETH'],
      },
    ],
  })
  news: []

  @ApiProperty({
    example: 123,
  })
  total: number

  @ApiProperty({
    example: 10,
  })
  countPerPage: number

  @ApiProperty({
    example: 1,
  })
  currentPage: 1
}
