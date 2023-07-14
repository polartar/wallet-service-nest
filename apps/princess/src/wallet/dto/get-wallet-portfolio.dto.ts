import { ApiProperty } from '@nestjs/swagger'
import { ECoinTypes, ENetworks, EPeriod } from '@rana/core'
import { IsEnum } from 'class-validator'

export class GetWalletPortfolioDto {
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
    default: EPeriod.All,
  })
  period: EPeriod

  @ApiProperty({
    name: 'networks',
    isArray: true,
    enum: [
      ENetworks.BITCOIN,
      ENetworks.BITCOIN_TEST,
      ENetworks.ETHEREUM,
      ENetworks.ETHEREUM_TEST,
    ],
    required: false,
    default: [ECoinTypes.ETHEREUM],
  })
  // @IsEnum(ENetworks, { each: true, always: false })
  networks: ENetworks[]
}

export class WalletPortfolioSwaggerResponse {
  @ApiProperty({
    example: '859513070656057616',
  })
  balance: string

  @ApiProperty({
    example: 1679077992,
  })
  timestamp: number

  @ApiProperty({
    example: '"1674.7041235028903"',
  })
  usdPrice: string
}
