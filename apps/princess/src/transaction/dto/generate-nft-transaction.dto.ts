import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'
import { ENFTTypes } from '../transaction.types'

export class GenerateNFTTransactionDto {
  @ApiProperty({
    description: 'from address of the transaction',
    default: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  })
  @IsNotEmpty()
  from: string

  @ApiProperty({
    description: 'to address of the transaction',
    default: '0xe456f9A32E5f11035ffBEa0e97D1aAFDA6e60F03',
  })
  @IsNotEmpty()
  to: string

  @ApiProperty({
    description: 'public key of the from address',
    default:
      '0314a259e3e0a781e928033f3bcab3c25f2e382417d7464cbefb9c9bb83d5a770d',
  })
  @IsNotEmpty()
  public_key: string

  @ApiProperty({
    description: 'NFT contract address',
    default: '0xc36442b4a4522e871399cd717abdd847ab11fe88',
  })
  @IsNotEmpty()
  contract_address: string

  @ApiProperty({
    description: 'NFT token Id',
    default: 52852,
  })
  @IsNotEmpty()
  tokenId: number

  @ApiProperty({
    description: 'NFT amount, this is only for ERC1155',
    default: 1,
  })
  @IsOptional()
  amount: number

  @ApiProperty({
    description: 'NFT type',
    enum: [ENFTTypes.ERC1155, ENFTTypes.ERC721],
    default: ENFTTypes.ERC1155,
  })
  type: ENFTTypes
}
