import { ApiProperty } from '@nestjs/swagger'
import { EWalletType } from '@rana/core'
import { IsNotEmpty } from 'class-validator'
export class CreateWalletDto {
  @ApiProperty({
    description: 'wallet type',
    enum: [EWalletType.HOTWALLET, EWalletType.METAMASK, EWalletType.VAULT],
    example: EWalletType.METAMASK,
  })
  wallet_type: EWalletType

  @ApiProperty({
    description: 'xPub, Bitcoin or Ethereum wallet address',
    example: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
  })
  @IsNotEmpty()
  x_pub: string
}

export class CreateWalletResponse {
  @ApiProperty({
    example: true,
  })
  isActive: boolean

  @ApiProperty({
    example: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  })
  xPub: string

  @ApiProperty({
    example: [
      {
        email: '',
        name: '',
        accountId: 3,
        id: 2,
      },
    ],
  })
  accounts: string

  @ApiProperty({
    example: 'metamask',
  })
  type: string

  @ApiProperty({
    example: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  })
  address: string

  @ApiProperty({
    example: [],
  })
  addresses: []

  @ApiProperty({
    example: 'm/44/60/0',
  })
  path: []

  @ApiProperty({
    example: 'eth',
  })
  coinType: string

  @ApiProperty({
    example: 1,
  })
  id: number

  @ApiProperty({
    example: 1684343715,
  })
  createdAt: number
}
