import { ApiProperty } from '@nestjs/swagger'
import { ECoinType } from '@rana/core'
import { IsNotEmpty } from 'class-validator'

export class GenerateTransactionDto {
  @ApiProperty({
    description: 'from address of the transaction',
    default: 'myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx',
  })
  @IsNotEmpty()
  from: string

  @ApiProperty({
    description: 'to address of the transaction',
    default: '2Mwd9FHUSVH2VgEZqvPfd7ikXsBLdW2suW5',
  })
  @IsNotEmpty()
  to: string

  @ApiProperty({
    description: 'amount that will be involved in the transaction',
    default: 1,
  })
  @IsNotEmpty()
  amount: number

  @ApiProperty({
    description: 'coin type',
    enum: [ECoinType.BITCOIN, ECoinType.ETHEREUM],
    default: ECoinType.BITCOIN,
  })
  coin_type: ECoinType
}
