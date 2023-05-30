import { ApiProperty } from '@nestjs/swagger'
import { EPeriod } from '@rana/core'
export class GetPortfolioDto {
  @ApiProperty({
    name: 'period',
    enum: [
      EPeriod.All,
      EPeriod.Day,
      EPeriod.Week,
      EPeriod.Month,
      EPeriod.Months,
      EPeriod.Year,
    ],
    required: false,
  })
  period: EPeriod
}

export class PortfolioSwaggerResponse {
  @ApiProperty({
    example: true,
  })
  isActive: boolean

  @ApiProperty({
    example: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  })
  xPub: string

  @ApiProperty({
    example: [
      {
        email: '',
        name: '',
        accountId: 3,
        id: 2,
      },
    ],
  })
  accounts: string

  @ApiProperty({
    example: 'metamask',
  })
  type: string

  @ApiProperty({
    example: [
      {
        isActive: true,
        id: 1,
        address: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
        createdAt: 1684343715,
        path: '/0/5',
        fee: {
          high_fee: '0.000000281316227971',
          medium_fee: '0.000000058461980841',
          low_fee: '0.000000005',
        },
        history: [
          {
            id: 1,
            balance: '126946376672449164',
            from: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
            to: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
            hash: '0xa70b380def09016af59abeb878d7a38f09d1a7026b1d6281cce007e9cfac8c29',
            amount: '0',
            tokenId: 52852,
            timestamp: '1685463120',
            usdBalance: '239.94809743123068',
            usdAmount: '0',
          },
          {
            id: 2,
            balance: '227433406994413955',
            from: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
            to: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
            hash: '0xec7c67d42f2dfec448f26f1b30d42fb9ebe07f6975f6b846a19a43484ad35781',
            amount: '10000000000000000',
            tokenId: null,
            timestamp: '1682560092',
            usdBalance: '429.8839772435667',
            usdAmount: '18.9015317901',
          },
        ],
      },
    ],
  })
  addresses: []

  @ApiProperty({
    example: 'm/44/60/0',
  })
  path: []

  @ApiProperty({
    example: 'eth',
  })
  coinType: string

  @ApiProperty({
    example: 1,
  })
  id: number

  @ApiProperty({
    example: 1684343715,
  })
  createdAt: number
}
