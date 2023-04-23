import { ApiProperty } from '@nestjs/swagger'

export class CoinMarketDto {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({
    example: [
      {
        price: 1874.621083749471,
        volume_24h: 6599445575.226892,
        volume_change_24h: -29.3848,
        percent_change_1h: 0.06553072,
        percent_change_24h: 1.33518568,
        percent_change_7d: -10.22659333,
        percent_change_30d: 5.48945262,
        percent_change_60d: 14.59974225,
        percent_change_90d: 15.78182666,
        market_cap: 225727135614.23663,
        market_cap_dominance: 19.3108,
        fully_diluted_market_cap: 225727135614.24,
        tvl: null,
        last_updated: '2023-04-23T14:19:00.000Z',
      },
    ],
  })
  data: []
}
