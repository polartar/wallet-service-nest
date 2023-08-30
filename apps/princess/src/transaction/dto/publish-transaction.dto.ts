import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty } from 'class-validator'
import { ENetworks } from '@rana/core'

export class PublishTransactionDto {
  @ApiProperty({
    description: 'signed payloads',
    example: [
      {
        address: '0x42cda393bbe6d079501B98cc9cCF1906901b10Bf',
        publickey:
          '02c00551a9b96c332410adaaed426dd0171311b8f5b6ebada246a6be8c24cac1c5',
        tosign:
          '30559a302192fbf575957cb44abe7016e117dd4ed7e3edf6fbf1c5280afa9415',
        signature:
          '32e9f0f876f4f46f412cbafb03111dda727d020325657af0388523effbfe0b8a2473dd2dfee4e03b8c9fdf5d48b3223450b237e5b5c4102c0a6dff9893970c07',
      },
    ],
  })
  @IsNotEmpty()
  signedPayloads: []

  @ApiProperty({
    description: 'serialized transaction object',
    example:
      '{"type":2,"from":"tbnb1l3ser3yu0s7zy09q5ypdpzk97kaqvfa47pqmp9","to":"tbnb1jchnhkse77d6x0a44qes4ey0pjf2etuts6stkz","value":{"value":"0.5","factor":1},"extra":{"transferMessage":"merhaba","publicKey":"02ea599a1a8a94c0d210a58b810ff603fc690f8ca524a6054abf29cf179ea126cd"},"nativeTransaction":{"sequence":19,"accountNumber":29524,"chainId":"Binance-Chain-Ganges","msg":{"inputs":[{"address":{"type":"Buffer","data":"base64:/GGRxJx8PCI8oKEC0IrF9boGJ7U="},"coins":[{"denom":"BNB","amount":500000000}]}],"outputs":[{"address":{"type":"Buffer","data":"base64:li872hn3m6M/tagzCuSPDJKsr4s="},"coins":[{"denom":"BNB","amount":500000000}]}],"aminoPrefix":"2A2C87FA"},"memo":"merhaba","source":0,"signatures":[]}}',
  })
  @IsNotEmpty()
  serializedTransaction: string

  @ApiProperty({
    description: 'network type',
    enum: [ENetworks.ETHEREUM, ENetworks.ETHEREUM_TEST],
    default: ENetworks.ETHEREUM_TEST,
  })
  @IsEnum(ENetworks)
  network: ENetworks
}
