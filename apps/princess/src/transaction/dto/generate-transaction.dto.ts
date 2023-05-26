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

export class GenerateTransactionSwaggerResponse {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({
    example: {
      tx: {
        block_height: -1,
        block_index: -1,
        hash: 'bd5190d55d1079677f63cb5a2ee73c81ad673ec33aa2c508978a851bae55103b',
        addresses: [
          'myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx',
          '2Mwd9FHUSVH2VgEZqvPfd7ikXsBLdW2suW5',
        ],
        total: 1571624,
        fees: 10100,
        size: 224,
        vsize: 224,
        preference: 'low',
        relayed_by: '102.129.146.73',
        received: '2023-04-23T15:58:45.741031066Z',
        ver: 1,
        double_spend: false,
        vin_sz: 1,
        vout_sz: 2,
        confirmations: 0,
        inputs: [
          {
            prev_hash:
              '25ca41c54247284260833d6727ca21c7055f3c96950c5237df639f9b24140453',
            output_index: 0,
            output_value: 1581724,
            sequence: 4294967295,
            addresses: ['myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx'],
            script_type: 'pay-to-pubkey-hash',
            age: 2416144,
          },
        ],
        outputs: [
          {
            value: 1,
            script: 'a9143005b247787fed18cce12be358d03b65545d6ff787',
            addresses: ['2Mwd9FHUSVH2VgEZqvPfd7ikXsBLdW2suW5'],
            script_type: 'pay-to-script-hash',
          },
          {
            value: 1571623,
            script: '76a914c6f335344041776a20279eb9ae9395127cace9d088ac',
            addresses: ['myeuSQtJdvgTKjYL1q9WU13zH3g5aRnjGx'],
            script_type: 'pay-to-pubkey-hash',
          },
        ],
      },
      tosign: [
        '4501ab245d117b0071f6de18bedc7ade219650b1d509894023bae1f778e90f1c',
      ],
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
