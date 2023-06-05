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

export class GenerateNFTTransactionSwaggerResponse {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({
    example:
      '0xf88a318501f5afbeda830156ab94c36442b4a4522e871399cd717abdd847ab11fe8880b86442842e0e000000000000000000000000dbc3a556693cbb5682127864fd80c8ae6976bfcf000000000000000000000000dbc3a556693cbb5682127864fd80c8ae6976bfcf000000000000000000000000000000000000000000000000000000000000ce74058080',
  })
  data: string

  @ApiProperty({
    example:
      'XNOtOD+CiVeLse5sD7h7KIZGcp7oXYDvkkoxPLPEp7ytr5ZMTmk5E7J0n37wWhqLoniCKl0BPhEQtLmlpduWrAiKJ9KiZq8K3QELXFSyCAWm7rWU/mv6qWu6whfN425lgmDDoIk+rAM0Nlm4BrIpWzlGxbaioi3o+g+HftQnX4M=',
  })
  signature: string
}
