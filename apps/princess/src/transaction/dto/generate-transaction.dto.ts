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
    description: 'public key of the from address',
    default:
      '0314a259e3e0a781e928033f3bcab3c25f2e382417d7464cbefb9c9bb83d5a770d',
  })
  @IsNotEmpty()
  public_key: string

  @ApiProperty({
    description: 'to address of the transaction',
    default: '2Mwd9FHUSVH2VgEZqvPfd7ikXsBLdW2suW5',
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
        factor: 0,
      },
      extra: {
        publicKey:
          '0314a259e3e0a781e928033f3bcab3c25f2e382417d7464cbefb9c9bb83d5a770d',
      },
      fee: {
        fee: {
          value: '0.0000035',
          factor: 0,
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
    },
  })
  data: string
}

export class PublishTransactionSwaggerResponse {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({
    example: {
      tx: {
        block_height: -1,
        block_index: -1,
        hash: '2a6e33c75b50be445606cee80aa3b2e9f280e9b5524d2cea4ca4ea69fa4910c9',
        addresses: [],
        total: 1858918,
        fees: 10200,
        size: 225,
        vsize: 225,
        preference: 'low',
        relayed_by: '102.129.146.73',
        received: '2023-04-23T16:02:30.840688368Z',
        ver: 1,
        double_spend: false,
        vin_sz: 1,
        vout_sz: 2,
        confirmations: 0,
        inputs: [],
        outputs: [],
      },
      tosign: [''],
    },
  })
  data: string

  @ApiProperty({
    example:
      'XNOtOD+CiVeLse5sD7h7KIZGcp7oXYDvkkoxPLPEp7ytr5ZMTmk5E7J0n37wWhqLoniCKl0BPhEQtLmlpduWrAiKJ9KiZq8K3QELXFSyCAWm7rWU/mv6qWu6whfN425lgmDDoIk+rAM0Nlm4BrIpWzlGxbaioi3o+g+HftQnX4M=',
  })
  signature: string
}
