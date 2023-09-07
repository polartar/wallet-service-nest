import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AssetService } from './asset.service'
import {
  AssetCreateSwaggerResponse,
  CreateAssetDto,
} from './dto/create-asset.dto'
import { AssetSwaggerResponse } from './dto/get-asset-portfolio.dto'
import { AssetTransactionSwaggerResponse } from './dto/get-asset-transaction.dto'
import { EPeriod } from '@rana/core'

@Controller('asset')
@ApiTags('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('')
  @ApiOkResponse({ type: AssetCreateSwaggerResponse })
  @ApiOperation({
    summary: 'Create asset',
  })
  async createAsset(@Body() data: CreateAssetDto) {
    if (!data.address && !data.xPub) {
      throw new BadRequestException('Require one of address or xpub')
    }
    return this.assetService.createAsset(data)
  }

  @Get(':assetId')
  @ApiOkResponse({ type: AssetSwaggerResponse })
  @ApiOperation({
    summary: 'Get Asset',
  })
  async getAsset(@Param('assetId') assetId: string) {
    return await this.assetService.getAsset(assetId)
  }

  @Get(':assetId/transactions')
  @ApiOkResponse({ type: [AssetTransactionSwaggerResponse] })
  @ApiOperation({
    summary: 'Get Asset',
  })
  async getAssetTransactions(@Param('assetId') assetId: string) {
    return await this.assetService.getAssetTransactions(assetId)
  }

  @Get(':assetId/portfolio')
  @ApiOkResponse({ type: AssetSwaggerResponse })
  @ApiOperation({
    summary: 'Get Asset',
  })
  async getAssetPortfolio(
    @Param('assetId') assetId: string,
    // @Query() query: GetAssetPortfolioDto,
  ) {
    return await this.assetService.getAssetPortfolio(assetId, EPeriod.All)
  }

  @Get(':assetId/nft')
  @ApiOkResponse({ type: AssetSwaggerResponse })
  @ApiOperation({
    summary: 'Get Asset',
  })
  async getAssetNFTs(
    @Param('assetId') assetId: string,
    @Query('page') pageNumber?: number,
  ) {
    return await this.assetService.getAssetNFTs(assetId, pageNumber)
  }
}
