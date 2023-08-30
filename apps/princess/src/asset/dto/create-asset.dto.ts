import { ApiProperty } from '@nestjs/swagger'
import { ENetworks } from '@rana/core'
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateAssetDto {
  @ApiProperty({
    description: 'The address of the asset',
    example: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
  })
  @IsNotEmpty()
  address: string

  @ApiProperty({
    description: 'The public key of the address',
    example:
      '02c00551a9b96c332410adaaed426dd0171311b8f5b6ebada246a6be8c24cac1c5',
  })
  @IsNotEmpty()
  publicKey: string

  @ApiProperty({
    description: 'The index of the asset',
  })
  @IsNotEmpty()
  index: number

  @ApiProperty({
    description: 'Network type',
    enum: [
      ENetworks.BITCOIN,
      ENetworks.BITCOIN_TEST,
      ENetworks.ETHEREUM,
      ENetworks.ETHEREUM_TEST,
    ],
    example: ENetworks.ETHEREUM,
  })
  @IsNotEmpty()
  @IsEnum(ENetworks)
  network: ENetworks

  @ApiProperty({
    description: 'The xPub',
    example:
      'xpub6BzwKCWVs4F9cpmYundX3PjbqcPqERCXKCAw8SRKQgXd1ybTxi338A2Ep6EbGhFp7up4L7PDWivUtnYNC79MWo6wN5SqzrhksQVJupArUxD',
  })
  @IsOptional()
  xPub: string
}

export class AssetCreateSwaggerResponse {
  @ApiProperty({
    example: '7e430da0-460b-47d7-b7da-c573bfccac21',
  })
  id: string

  @ApiProperty({
    example: 0,
  })
  index: number

  @ApiProperty({
    example: ENetworks.ETHEREUM,
  })
  network: string

  @ApiProperty({
    example: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
  })
  address: string
}
