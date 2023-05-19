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

export class GetPortfolioResponse {
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
        history: [
          {
            balance: '664635670753339226',
            timestamp: '1681263972',
          },
          {
            balance: '667691852859614926',
            timestamp: '1681238280',
          },
          {
            balance: '673156203487535272',
            timestamp: '1681237800',
          },
          {
            balance: '675950233163566481',
            timestamp: '1681237776',
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
