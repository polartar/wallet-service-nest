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
import { AssetSwaggerResponse, CreateAssetDto } from './dto/create-asset.dto'
import { GetAssetPortfolioDto } from './dto/get-asset-portfolio.dto'
import {
  AssetTransactionSwaggerResponse,
  GetAssetTransactionDto,
} from './dto/get-asset-transaction.dto'

@Controller('asset')
@ApiTags('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('')
  @ApiOkResponse({ type: AssetSwaggerResponse })
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
  async getAssetTransactions(
    @Param('assetId') assetId: string,
    @Query() query: GetAssetTransactionDto,
  ) {
    return await this.assetService.getAssetTransactions(
      assetId,
      query.start,
      query.count,
    )
  }

  @Get(':assetId/portfolio')
  @ApiOkResponse({ type: AssetSwaggerResponse })
  @ApiOperation({
    summary: 'Get Asset',
  })
  async getAssetPortfolio(
    @Param('assetId') assetId: string,
    @Query() query: GetAssetPortfolioDto,
  ) {
    return await this.assetService.getAssetPortfolio(assetId, query.period)
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

  //   @Get(':walletId/transactions')
  //   @ApiOkResponse({ type: WalletSwaggerResponse })
  //   @ApiOperation({
  //     summary:
  //       'Time series data, where date is timestamp (number), and the value of that date.',
  //   })
  //   async getWalletTransaction(
  //     @Param('walletId') walletId: number,
  //     @Query() query: GetWalletTransactionDto,
  //   ) {
  //     return await this.walletService.getWalletTransaction(
  //       walletId,
  //       query.start,
  //       query.count,
  //     )
  //   }

  //   @Get(':walletId/portfolio')
  //   @ApiOkResponse({ type: WalletSwaggerResponse })
  //   @ApiOperation({
  //     summary:
  //       'Time series data, where date is timestamp (number), and the value of that date.',
  //   })
  //   async getWalletPortfolio(
  //     @Param('walletId') walletId: number,
  //     @Query() query?: GetWalletPortfolioDto,
  //   ) {
  //     if (query && query.period) {
  //       return await this.walletService.getWalletPortfolio(walletId, query.period)
  //     } else {
  //       return await this.walletService.getWallet(walletId)
  //     }
  //   }

  //   @Get('')
  //   @ApiOkResponse({ type: WalletsSwaggerResponse })
  //   @ApiOperation({
  //     summary:
  //       'Time series data, where date is timestamp (number), and the value of that date.',
  //   })
  //   async getWallets() {
  //     return await this.walletService.getWallets()
  //   }

  //   @Patch(':walletId')
  //   @ApiOperation({
  //     summary: 'Update the wallet object',
  //   })
  //   async updateWallet(
  //     @Param('walletId') walletId: number,
  //     @Body() data: UpdateWalletDto,
  //   ) {
  //     if (!data.mnemonic && !data.title) {
  //       throw new BadRequestException('Should input at least title or mnemonic')
  //     } else if (data.mnemonic && data.title) {
  //       throw new BadRequestException('Should input one of title or mnemonic')
  //     }

  //     return await this.walletService.updateWallet(
  //       walletId,
  //       data.title,
  //       data.mnemonic,
  //     )
  //   }
}
