import { ApiProperty } from '@nestjs/swagger'
import { EPeriod } from '@rana/core'
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
  })
  @IsEnum(EPeriod)
  period: EPeriod
}
