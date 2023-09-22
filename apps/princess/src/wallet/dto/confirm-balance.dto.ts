import { ApiProperty } from '@nestjs/swagger'
import { ENetworks } from '@rana/core'
import { IsNotEmpty } from 'class-validator'

export class ConfirmBalanceDto {
  @ApiProperty({ description: 'address' })
  @IsNotEmpty()
  address: string

  @ApiProperty({ description: 'network' })
  @IsNotEmpty()
  network: ENetworks
}
