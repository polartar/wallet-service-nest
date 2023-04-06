import { ApiProperty } from '@nestjs/swagger'
import { ECoinType } from '@rana/core'
import { IsNotEmpty } from 'class-validator'

export class GenerateTransactionDto {
  @ApiProperty({ description: 'from address of the transaction' })
  @IsNotEmpty()
  from: string

  @ApiProperty({ description: 'to address of the transaction' })
  @IsNotEmpty()
  to: string

  @ApiProperty({
    description: 'amount that will be involved in the transaction',
  })
  @IsNotEmpty()
  amount: number

  @ApiProperty({
    description: 'coin type',
    enum: [ECoinType.BITCOIN, ECoinType.ETHEREUM],
  })
  coin_type: ECoinType
}
