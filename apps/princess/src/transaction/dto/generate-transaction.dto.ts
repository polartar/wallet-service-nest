import { ApiProperty } from '@nestjs/swagger'
import { ENetworks } from '@rana/core'
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator'

export class GenerateTransactionDto {
  @ApiProperty({
    description: 'from address of the transaction',
    default: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  })
  @IsNotEmpty()
  from: string

  @ApiProperty({
    description: 'to address of the transaction',
    default: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  })
  @IsNotEmpty()
  to: string

  @ApiProperty({
    description:
      'amount that will be involved in the transaction, this will be ETH/BTC',
    default: '0.0001',
  })
  @IsNotEmpty()
  amount: string

  @ApiProperty({
    description: 'network type',
    enum: ENetworks,
    default: ENetworks.ETHEREUM_TEST,
  })
  @IsEnum(ENetworks)
  network: ENetworks

  @ApiProperty({
    description: 'transfer message',
    default: 'merhaba',
  })
  @IsOptional()
  transferMessage: string
}

export class GenerateTransactionSwaggerResponse {
  @ApiProperty({
    example: 2,
  })
  type: number

  @ApiProperty({
    example: 'bc1q5s27084850yzghuer59l5e8mm66t3n2rufevyn',
  })
  from: string

  @ApiProperty({
    example: 'bc1q5s27084850yzghuer59l5e8mm66t3n2rufevyn',
  })
  to: string

  @ApiProperty({
    example: {
      value: '0.000001',
      factor: 1,
    },
  })
  value: object

  @ApiProperty({
    example: {
      publicKey:
        '02b807681562fedc919ceb74b2a10b2b0362afe31f23ac6ac2ab7dbb97adfbdb8a',
    },
  })
  extra: object

  @ApiProperty({
    example: {
      value: '0.0000035',
      factor: 1,
    },
  })
  fee: object

  @ApiProperty({
    example: [
      {
        address: 'bc1q5s27084850yzghuer59l5e8mm66t3n2rufevyn',
        publickey:
          '02b807681562fedc919ceb74b2a10b2b0362afe31f23ac6ac2ab7dbb97adfbdb8a',
        tosign:
          'b4470cde5e4efd25c2dbc65d7a9cabf646a64ec152ab5e30551e7d4dfde01eb3',
      },
    ],
  })
  signingPayloads: object

  @ApiProperty({
    example:
      'c7c8751b631e495dcffe7669f8160100000000ffffffff0264000000000000001600144f84b65b06873f535c2a101dac779456f7166ecd25771e0000000000160014ac085e2b15395c636ee74658aa3df08fdff44a02000000000001011fe7781e0000000000160014ac085e2b15395',
  })
  signedPayload: string

  @ApiProperty({
    example: {},
  })
  nativeTransaction: object
  @ApiProperty({
    example: '',
  })
  serializedTransaction: string
}

export class PublishTransactionSwaggerResponse {
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
