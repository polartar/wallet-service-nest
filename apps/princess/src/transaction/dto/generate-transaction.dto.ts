import { ApiProperty } from '@nestjs/swagger'
import { ECoinType } from '@rana/core'
import { IsNotEmpty } from 'class-validator'

export class GenerateTransactionDto {
  @ApiProperty({
    description: 'from address of the transaction',
    default: '1LxbXpKe63qUJuEozUFNG2aHHCMbYBxoTV',
  })
  @IsNotEmpty()
  from: string

  @ApiProperty({
    description: 'public key of the from address',
    default:
      '03adc2e9b0397d3c72f50cf8fb6ffc579076c783ebd081083ac1c4efe3e24d388e',
  })
  @IsNotEmpty()
  public_key: string

  @ApiProperty({
    description: 'to address of the transaction',
    default: '1LxbXpKe63qUJuEozUFNG2aHHCMbYBxoTV',
  })
  @IsNotEmpty()
  to: string

  @ApiProperty({
    description:
      'amount that will be involved in the transaction, this will be ETH/BTC',
    default: '0.000001',
  })
  @IsNotEmpty()
  amount: string

  @ApiProperty({
    description: 'coin type',
    enum: [ECoinType.BITCOIN, ECoinType.ETHEREUM],
    default: ECoinType.BITCOIN,
  })
  coin_type: ECoinType
}

export class GenerateTransactionSwaggerResponse {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({
    example: {
      type: 2,
      from: 'tb1q4sy9u2c489wxxmh8gev2500s3l0lgjszq2jkhw',
      to: 'tb1qf7ztvkcxsul4xhp2zqw6cau52mm3vmkdh5uyzz',
      value: {
        value: '0.000001',
        factor: 1,
      },
      extra: {
        publicKey:
          '03adc2e9b0397d3c72f50cf8fb6ffc579076c783ebd081083ac1c4efe3e24d388e',
      },
      fee: {
        fee: {
          value: '0.0000035',
          factor: 1,
        },
      },
      signingPayloads: [
        {
          address: 'tb1q4sy9u2c489wxxmh8gev2500s3l0lgjszq2jkhw',
          publickey:
            '0314a259e3e0a781e928033f3bcab3c25f2e382417d7464cbefb9c9bb83d5a770d',
          tosign:
            'b4470cde5e4efd25c2dbc65d7a9cabf646a64ec152ab5e30551e7d4dfde01eb3',
        },
      ],
      signedPayload:
        'c7c8751b631e495dcffe7669f8160100000000ffffffff0264000000000000001600144f84b65b06873f535c2a101dac779456f7166ecd25771e0000000000160014ac085e2b15395c636ee74658aa3df08fdff44a02000000000001011fe7781e0000000000160014ac085e2b15395',
      nativeTransaction: {},
      serializedTransaction: '',
    },
  })
  data: string
}

export class PublishTransactionSwaggerResponse {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({
    example: {
      type: 'string',
    },
  })
  meta: object

  @ApiProperty({
    example: {
      txhash: 'string',
    },
  })
  data: object
}
