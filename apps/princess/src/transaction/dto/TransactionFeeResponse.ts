import { ApiProperty } from '@nestjs/swagger'

export class TransactionFeeResponse {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({
    example: {
      original: {
        high_fee: 143045826663,
        medium_fee: 42684178092,
        low_fee: 5000000000,
      },
      convert: {
        high_fee: '0.000000143045826663',
        medium_fee: '0.000000042684178092',
        low_fee: '0.000000005',
      },
    },
  })
  data: string
}
