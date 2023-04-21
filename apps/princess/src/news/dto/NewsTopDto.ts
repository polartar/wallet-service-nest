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

export class TopNewsResponse {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({
    example: [
      {
        pubDateUtc: '2023-04-21T14:04:55.000Z',
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
  data: []
}
