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

export class WalletSwaggerResponse {
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
    example: [
      {
        isActive: true,
        id: 1,
        address: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
        createdAt: 1685445893,
        coinType: 'eth',
        path: 'm/44/60/0/0/5',
        fee: {
          high_fee: '0.000000281316227971',
          medium_fee: '0.000000058461980841',
          low_fee: '0.000000005',
        },
        history: [
          {
            balance: '126946376672449164',
            from: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
            to: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
            amount: '0',
            tokenId: 52852,
            timestamp: '1685463120',
            usdBalance: '239.94809743123068',
            usdAmount: '0',
          },
          {
            balance: '227433406994413955',
            from: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
            to: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
            amount: '10000000000000000',
            tokenId: null,
            timestamp: '1682560092',
            usdBalance: '429.8839772435667',
            usdAmount: '18.9015317901',
          },
        ],
      },
    ],
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
