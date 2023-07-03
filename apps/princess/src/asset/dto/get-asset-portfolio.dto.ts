import { ApiProperty } from '@nestjs/swagger'
import { EPeriod } from '@rana/core'

export class GetAssetPortfolioDto {
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
