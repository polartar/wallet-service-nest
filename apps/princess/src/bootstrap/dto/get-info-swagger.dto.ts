import { ApiProperty } from '@nestjs/swagger'

export class GetInfoSwaggerResponse {
  @ApiProperty({
    example: '1.0.1',
  })
  minAppVersion: string

  @ApiProperty({
    example: '1.0.11',
  })
  latestAppVersion: string

  @ApiProperty({
    example: '2.0.1',
  })
  serverVersion: string

  @ApiProperty({
    example: {
      rick: 'up',
    },
  })
  self: string

  @ApiProperty({
    example: {
      'blockcypher.com': 'up',
      'etherscan.io': 'down',
    },
  })
  '3rdParty': string
}
