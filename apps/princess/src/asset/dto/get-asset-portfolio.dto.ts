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
        metadata: {
          name: 'Capsule Card #3',
          description: 'Capsule Card #3',
          image:
            'ipfs://QmbZfyLc11tEySZpum4DH7uS1ZjS4LNe53by4KaWVsCivq/card3.png',
          externalUrl: null,
          attributes: [
            { traitType: 'Nose', value: 'Base' },
            { traitType: 'Eyebrows', value: 'Neutral' },
            { traitType: 'Skin Tone', value: 'Neutral' },
            { traitType: 'Hair Front', value: 'Messy Layered' },
            { traitType: 'Head Accessory', value: 'Big Side Horns' },
            { traitType: 'Eyes', value: 'Upturned' },
            { traitType: 'Eye Color', value: 'Red' },
            { traitType: 'Mouth', value: 'Eyetooth' },
            { traitType: 'Outfit', value: 'Red Wave Qipao' },
            { traitType: 'Hair Back', value: 'Wide Long' },
            { traitType: 'Hair Color', value: 'Light Blonde' },
            { traitType: 'Appendage', value: 'Dragon Wings' },
            { traitType: 'Background', value: 'Green' },
          ],
        },
        owner_of: '0xe456f9a32e5f11035ffbea0e97d1aafda6e60f03',
        contract_type: 'ERC1155',
        token_hash: '1b3f18c73d9348586c56263d13d6b733',
        network: 'eth_goerli',
        collection_address: '0x816c99843ebcdce2d247cec7f3f5f3972d14070c',
        token_id: '211',
      },
    ],
  })
  nfts: []
}
