import { ApiProperty } from '@nestjs/swagger'
import { ESort } from '../news.types'
import { IsOptional } from 'class-validator'
import { ENetworks } from '@rana/core'

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
    enum: [ENetworks.BITCOIN, ENetworks.ETHEREUM],
    required: false,
  })
  @IsOptional()
  symbol: ENetworks

  @ApiProperty({ description: 'highlights news', required: false })
  @IsOptional()
  highlights: number
}

export class PaginationNewsSwaggerResponse {
  example: {
    news: [
      {
        pubDateUtc: 1684256400
        title: 'OP Erigon released as new client software for Optimism on testnet'
        author: 'Vishal Chawla'
        source: 'theblock'
        description: "Optimism contributors emphasize that multiple clients can help prevent a single point of failure, bolstering the network's resilience."
        link: 'https://www.theblock.co/post/227593/optimism-client-op-erigon-released?utm_source=fidelity&utm_medium=rss'
        textCleaned: 'Test in'
        assetList: ['ETH']
      },
      {
        pubDateUtc: 1684266400
        title: 'OP Erigon released as new client software for Optimism on testnet'
        author: 'Vishal Chawla'
        source: 'theblock'
        description: "Optimism contributors emphasize that multiple clients can help prevent a single point of failure, bolstering the network's resilience."
        link: 'https://www.theblock.co/post/227593/optimism-client-op-erigon-released?utm_source=fidelity&utm_medium=rss'
        textCleaned: 'Test in'
        assetList: ['ETH']
      },
    ]
    total: 32728
    currentPage: 1
    countPerPage: 2
  }

  data: {
    news: []
    total: number
    currentPage: number
    countPerPage: number
  }
}
