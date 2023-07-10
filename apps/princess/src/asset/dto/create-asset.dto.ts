import { ApiProperty } from '@nestjs/swagger'
import { ENetworks } from '@rana/core'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateAssetDto {
  @ApiProperty({
    description: 'The address of the asset',
    example: '0xdBC3A556693CBb5682127864fd80C8ae6976bfcf',
  })
  @IsOptional()
  address: string

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
  network: ENetworks

  @ApiProperty({
    description: 'The xPub',
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
