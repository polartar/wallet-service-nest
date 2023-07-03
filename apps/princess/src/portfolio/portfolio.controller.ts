import { EPortfolioType } from '@rana/core'
import { PortfolioService } from './portfolio.service'
import { IUpdatedAssets } from './portfolio.types'
import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('portfolio')
@ApiTags('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('updated')
  @ApiOperation({ summary: "This api can't be called directly" })
  async updatedAddresses(
    @Body('type', new ParseEnumPipe(EPortfolioType)) type: EPortfolioType,
    @Body('data') data: IUpdatedAssets[],
  ) {
    this.portfolioService.handleUpdatedAddresses(type, data)
  }

  // @Get('/nft/:address')
  // @ApiOperation({ summary: 'Get NFT assets from address' })
  // async getNFTAssets(
  //   @Param('address') address: string,
  //   @Query('page') pageNumber?: number,
  // ) {
  //   return this.portfolioService.getNFTAssets(address, pageNumber)
  // }
}
