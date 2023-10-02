import { ApiProperty } from '@nestjs/swagger'
import { ENetworks } from '@rana/core'
import { IsNotEmpty } from 'class-validator'

export class ConfirmBalanceDto {
  @ApiProperty({ description: 'Address' })
  @IsNotEmpty()
  address: string

  @ApiProperty({
    description: 'Network',
    enum: [
      ENetworks.BITCOIN,
      ENetworks.BITCOIN_TEST,
      ENetworks.ETHEREUM,
      ENetworks.ETHEREUM_TEST,
    ],
    example: ENetworks.ETHEREUM,
  })
  @IsNotEmpty()
  network: ENetworks
}
