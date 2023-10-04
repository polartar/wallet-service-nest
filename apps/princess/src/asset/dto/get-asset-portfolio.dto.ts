import { ApiProperty } from '@nestjs/swagger'
import { ENetworks, EPeriod } from '@rana/core'
import { IsEnum } from 'class-validator'

export class GetAssetPortfolioDto {
  @ApiProperty({
    name: 'period',
    enum: [
      EPeriod.All,
      EPeriod.Day,
      EPeriod.Week,
      EPeriod.Month,
      EPeriod.Months,
      EPeriod.Year,
    ],
    required: false,
  })
  @IsEnum(EPeriod)
  period: EPeriod
}

export class AssetSwaggerResponse {
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

  @ApiProperty({
    example:
      '0310F1C443F7F68843BCA3451773DE7889F60EA7B88FEB20963517851C00068550',
  })
  publicKey: string

  @ApiProperty({
    example: {
      fiat: '226.75801875555356',
      crypto: '118408804060537227',
    },
  })
  balance: object

  @ApiProperty({
    example: [
      {
        id: 'a22d1d1c-6fa7-403d-8681-c254e3c20284',
        network: 'eth_goerli',
        contractType: 'ERC721',
        ownerOf: '0xe456f9a32e5f11035ffbea0e97d1aafda6e60f03',
        hash: '0f2f852ab00044fd261f531bffc34577',
        name: 'Asuna #7',
        tokenId: '7',
        collectionAddress: '0xc5b8758773a69ae33b8d8b95f75de2f626498c29',
        description:
          'Glimpse into 10,000 unique lives lived by Asuna through this collection of hand-drawn, anime-inspired NFTs by Zumi and Hagglefish.',
        image: 'ipfs://QmfDxCgZ7gKwPrDMHs9jS3HAkH8GAysCWBZTMoSqPqgUDV/7.jpg',
        amount: '1',
        externalUrl: null,
        attributes:
          '[{"traitType":"Nose","value":"Base"},{"traitType":"Eyebrows","value":"Neutral"},{"traitType":"Skin Tone","value":"Neutral"},{"traitType":"Hair Front","value":"Messy Layered"},{"traitType":"Head Accessory","value":"Big Side Horns"},{"traitType":"Eyes","value":"Upturned"},{"traitType":"Eye Color","value":"Red"},{"traitType":"Mouth","value":"Eyetooth"},{"traitType":"Outfit","value":"Red Wave Qipao"},{"traitType":"Hair Back","value":"Wide Long"},{"traitType":"Hair Color","value":"Light Blonde"},{"traitType":"Appendage","value":"Dragon Wings"},{"traitType":"Background","value":"Green"}]',
      },
    ],
  })
  nfts: []
}
