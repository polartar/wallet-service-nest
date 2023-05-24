import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class PublishNFTTransactionDto {
  @ApiProperty({
    description: 'The hash of signed transaction',
    default:
      '0xf8ca2885116d2fda4a830156ab94c36442b4a4522e871399cd717abdd847ab11fe8880b86442842e0e000000000000000000000000dbc3a556693cbb5682127864fd80c8ae6976bfcf000000000000000000000000dbc3a556693cbb5682127864fd80c8ae6976bfcf000000000000000000000000000000000000000000000000000000000000ce742ea07d7e64c151810f8f770f3c59493849244050433d4fed3262fa610d19588ba40ea077fa5b55d3cb8cbb37086fb4d63d8808769aafde0c686b214629795d74eb4579',
  })
  @IsNotEmpty()
  signed_hash: string
}
