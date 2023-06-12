import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { ECoinType } from '@rana/core'

export class PublishTransactionDto {
  @ApiProperty({
    description: 'signed transaction object',
  })
  @IsNotEmpty()
  transaction: object

  @ApiProperty({
    description: 'coin type',
    enum: [ECoinType.BITCOIN, ECoinType.ETHEREUM],
    default: ECoinType.BITCOIN,
  })
  coin_type: ECoinType
}
