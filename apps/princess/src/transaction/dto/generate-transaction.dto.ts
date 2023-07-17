import { ApiProperty } from '@nestjs/swagger'
import { ENetworks } from '@rana/core'
import { IsEnum, IsNotEmpty } from 'class-validator'

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
    enum: ENetworks,
    default: ENetworks.BITCOIN,
  })
  @IsEnum(ENetworks)
  coin_type: ENetworks
}

export class GenerateTransactionSwaggerResponse {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({
    example: {
      type: 2,
      from: 'bc1q5s27084850yzghuer59l5e8mm66t3n2rufevyn',
      to: 'bc1q5s27084850yzghuer59l5e8mm66t3n2rufevyn',
      value: {
        value: '0.000001',
        factor: 1,
      },
      extra: {
        publicKey:
          '02b807681562fedc919ceb74b2a10b2b0362afe31f23ac6ac2ab7dbb97adfbdb8a',
      },
      fee: {
        fee: {
          value: '0.0000035',
          factor: 1,
        },
      },
      signingPayloads: [
        {
          address: 'bc1q5s27084850yzghuer59l5e8mm66t3n2rufevyn',
          publickey:
            '02b807681562fedc919ceb74b2a10b2b0362afe31f23ac6ac2ab7dbb97adfbdb8a',
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
