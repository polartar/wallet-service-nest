import { ApiProperty } from '@nestjs/swagger'

export class AssetTransactionSwaggerResponse {
  @ApiProperty({
    example: '0x42cda393bbe6d079501B98cc9cCF1906901b10Bf',
  })
  from: string

  @ApiProperty({
    example: '0x9dDAd761dfD8700BC401c7c880c2a32cC47Bf7c8',
  })
  to: string

  @ApiProperty({
    example: '0',
  })
  balance: string

  @ApiProperty({
    example: '123123123',
  })
  cryptoAmount: string

  @ApiProperty({
    example: null,
  })
  tokenId: number

  @ApiProperty({
    example: '1651928714',
  })
  timestamp: number

  @ApiProperty({
    example: 'eth_goerli',
  })
  network: string
}
