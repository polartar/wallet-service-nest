import { ApiProperty } from '@nestjs/swagger'

export class CoinHistoryResponse {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({
    example: [
      {
        exchange: 'Summary',
        periodStart: 1684339948,
        periodEnd: 1694339948,
        priceOpen: 1865.428849181794,
        priceClose: 1866.87385906316,
        priceLow: 1859.37032859723,
        priceHigh: 1872.119057437308,
        volumeQuote: 138920417.14121225,
        vwap: 1865.278006395343,
      },
      {
        exchange: 'Summary',
        periodStart: 1684339948,
        periodEnd: 1694339948,
        priceOpen: 1866.918342663015,
        priceClose: 1875.151480801537,
        priceLow: 1865.983269876373,
        priceHigh: 1883.525464028522,
        volumeQuote: 179176319.44951627,
        vwap: 1875.958668352975,
      },
      {
        exchange: 'Summary',
        periodStart: 1684339948,
        periodEnd: 1694339948,
        priceOpen: 1875.167500993446,
        priceClose: 1881.762449742041,
        priceLow: 1874.018960248871,
        priceHigh: 1887.575709274582,
        volumeQuote: 93531286.71953475,
        vwap: 1882.297240220193,
      },
    ],
  })
  data: []
}
