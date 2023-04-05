import { ApiProperty } from '@nestjs/swagger'
import { EWalletType } from '@rana/core'
import { IsNotEmpty } from 'class-validator'
export class CreateWalletDto {
  @ApiProperty({
    description: 'wallet type',
    enum: [EWalletType.HOTWALLET, EWalletType.METAMASK, EWalletType.VAULT],
  })
  wallet_type: EWalletType

  @ApiProperty({ description: 'xPub or Ethereum wallet address' })
  @IsNotEmpty()
  x_pub: string
}
