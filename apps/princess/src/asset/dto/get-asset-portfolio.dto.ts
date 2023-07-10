import { ApiProperty } from '@nestjs/swagger'
import { ENetworks, EPeriod } from '@rana/core'

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
    example: {
      fiat: '226.75801875555356',
      crypto: '118408804060537227',
    },
  })
  balance: object

  @ApiProperty({
    example: [
      {
        token_address: '0xb66a603f4cfe17e3d27b87a8bfcad319856518b8',
        token_id:
          '30215980622330187411918288900688501299580125367569939549692495857307848015879',
        owner_of: '0x42cda393bbe6d079501b98cc9ccf1906901b10bf',
        block_number: '15881936',
        block_number_minted: '14707663',
        token_hash: 'ff54a4ee4547eabd7d2f00af02955e45',
        amount: '2',
        contract_type: 'ERC1155',
        name: 'Rarible',
        symbol: 'RARI',
        token_uri:
          'https://ipfs.moralis.io:2053/ipfs/QmNjTf5nZ3qfoSaUyx3wSJmhuymFKb8QGH7BtPgw95VQN1',
        metadata:
          '{"name":"Demo Gods #5","description":"Tormented NFT stuck in limbo","image":"ipfs://ipfs/QmZ7nuzrgtEFGGXjaNzDuBToRyYQDspw7CVnEdENZJT1Nv/image.gif","external_url":"https://rarible.com/token/0xb66a603f4cfe17e3d27b87a8bfcad319856518b8:30215980622330187411918288900688501299580125367569939549692495857307848015879","attributes":[{"key":"Type","trait_type":"Type","value":"Loader"},{"key":"Magic","trait_type":"Magic","value":"Unknown"},{"key":"Minted","trait_type":"Minted","value":"No"},{"key":"NFT Type","trait_type":"NFT Type","value":"1155"}]}',
        last_token_uri_sync: 1669667944,
        last_metadata_sync: 1688475619,
        minter_address: "ERC1155 tokens don't have a single minter",
        possible_spam: false,
      },
    ],
  })
  nfts: []
}
