import { ApiProperty } from '@nestjs/swagger'
import { ECoinTypes, EPeriod } from '@rana/core'
import { IsEnum } from 'class-validator'

export class GetWalletPortfolioDto {
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
    default: EPeriod.All,
  })
  period: EPeriod

  @ApiProperty({
    name: 'coinType',
    enum: [ECoinTypes.BITCOIN, ECoinTypes.ETHEREUM],
    required: false,
    default: ECoinTypes.ETHEREUM,
  })
  coinType: ECoinTypes
}

export class WalletPortfolioSwaggerResponse {
  @ApiProperty({
    example: '859513070656057616',
  })
  balance: string

  @ApiProperty({
    example: 1679077992,
  })
  timestamp: number

  @ApiProperty({
    example: '"1674.7041235028903"',
  })
  usdPrice: string
}
