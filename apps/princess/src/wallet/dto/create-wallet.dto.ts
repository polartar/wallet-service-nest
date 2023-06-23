import { ApiProperty } from '@nestjs/swagger'
import { EWalletType } from '@rana/core'
import { IsNotEmpty, IsOptional } from 'class-validator'
export class CreateWalletDto {
  @ApiProperty({
    description: 'wallet type',
    enum: [EWalletType.HOTWALLET, EWalletType.LOCALWALLET, EWalletType.VAULT],
    example: EWalletType.LOCALWALLET,
  })
  wallet_type: EWalletType

  @ApiProperty({
    description: 'The title of the wallet',
    example: 'My wallet',
  })
  @IsNotEmpty()
  title: string

  @ApiProperty({
    description: 'The encrypted mnemonic of the wallet',
  })
  @IsOptional()
  mnemonic?: string

  @ApiProperty({
    description: 'array of parts that are encoded',
    default: ['UR:BYTES/GHCPGTKKCXJTHSJNIHCXINJKCXGAJKJNHSIHIHJZCPNYHLZTFR'],
  })
  @IsNotEmpty()
  parts: string[]

  @ApiProperty({
    description: 'The ids of the assets',
    example: [1, 2, 3],
  })
  assets: number[]
}

export class WalletSwaggerResponse {
  @ApiProperty({
    example: 'My Wallet',
  })
  name: string

  @ApiProperty({
    example: 'My mnemonic',
  })
  mnemonic: string

  @ApiProperty({
    example: [
      {
        email: '',
        name: '',
        walletId: 3,
        id: 2,
      },
    ],
  })
  accounts: string

  @ApiProperty({
    example: 'hot_wallet',
  })
  type: string

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
            tokenId: '52852',
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
  assets: []

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

export class WalletsSwaggerResponse {
  example: [
    {
      id: '{{wallet-with-1-asset}}'
      title: 'Bla Blo'
      mnemonic: 'You either achieve death, or die trying'
      assets: ['{{asset-1-btc}}']
    },
    {
      id: '{{wallet-with-2-asset}}'
      title: 'x2'
      mnemonic: 'Not gonna give you up'
      assets: ['{{asset-2-btc}}', '{{asset-1-eth}}', '{{asset-2-eth}}']
    },
  ]
}
