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
    example: '2023-04-23T23:18:40.347Z',
  })
  createdAt: string
}
