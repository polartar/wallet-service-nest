import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { ECoinType } from '@rana/core'

export class PublishTransactionDto {
  @ApiProperty({
    description: 'signed transaction hash',
    example:
      '555b9f751ac096d2d64b2e6915e23c9af60b1d4ab5e0e7e791f5945215cbeb6901335dc8371ceea290ae74469554875a2a152ac868b14f7582e3ab82b9296d3e',
  })
  @IsNotEmpty()
  signature: string

  @ApiProperty({
    description: 'serialized transaction object',
    example:
      '{"type":2,"from":"tbnb1l3ser3yu0s7zy09q5ypdpzk97kaqvfa47pqmp9","to":"tbnb1jchnhkse77d6x0a44qes4ey0pjf2etuts6stkz","value":{"value":"0.5","factor":1},"extra":{"transferMessage":"merhaba","publicKey":"02ea599a1a8a94c0d210a58b810ff603fc690f8ca524a6054abf29cf179ea126cd"},"nativeTransaction":{"sequence":19,"accountNumber":29524,"chainId":"Binance-Chain-Ganges","msg":{"inputs":[{"address":{"type":"Buffer","data":"base64:/GGRxJx8PCI8oKEC0IrF9boGJ7U="},"coins":[{"denom":"BNB","amount":500000000}]}],"outputs":[{"address":{"type":"Buffer","data":"base64:li872hn3m6M/tagzCuSPDJKsr4s="},"coins":[{"denom":"BNB","amount":500000000}]}],"aminoPrefix":"2A2C87FA"},"memo":"merhaba","source":0,"signatures":[]}}',
  })
  @IsNotEmpty()
  serializedTransaction: string

  @ApiProperty({
    description: 'coin type',
    enum: [ECoinType.BITCOIN, ECoinType.ETHEREUM],
    default: ECoinType.BITCOIN,
  })
  coin_type: ECoinType
}
