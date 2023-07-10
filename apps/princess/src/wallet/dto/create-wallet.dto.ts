import { ApiProperty } from '@nestjs/swagger'
import { EWalletType } from '@rana/core'
import { IsNotEmpty, IsOptional } from 'class-validator'
export class CreateWalletDto {
  @ApiProperty({
    description: 'wallet type',
    enum: [EWalletType.HOTWALLET, EWalletType.LOCALWALLET, EWalletType.VAULT],
    example: EWalletType.LOCALWALLET,
  })
  walletType: EWalletType

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
  @IsOptional()
  parts: string[]

  @ApiProperty({
    description: 'The ids of the assets',
    example: ['7e430da0-460b-47d7-b7da-c573bfccac21'],
  })
  @IsOptional()
  assets: string[]
}

export class WalletSwaggerResponse {
  @ApiProperty({
    example: '7e430da0-460b-47d7-b7da-c573bfccac21',
  })
  id: string

  @ApiProperty({
    example: 'My Wallet',
  })
  title: string

  @ApiProperty({
    example: 'My mnemonic',
  })
  mnemonic: string

  @ApiProperty({
    example: ['{{asset-2-btc}}', '{{asset-1-eth}}', '{{asset-2-eth}}'],
  })
  assets: []
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
