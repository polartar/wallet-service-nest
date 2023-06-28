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
import { GetWalletTransactionDto } from '../wallet/dto/get-wallet-transaction.dto'

@Controller('asset')
@ApiTags('wallet')
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
    this.assetService.createAsset(data)
  }

  @Get(':assetId')
  @ApiOkResponse({ type: AssetSwaggerResponse })
  @ApiOperation({
    summary: 'Get Asset',
  })
  async getAsset(@Param('assetId') assetId: number) {
    return await this.assetService.getAsset(assetId)
  }

  @Get(':assetId/transactions')
  @ApiOkResponse({ type: AssetSwaggerResponse })
  @ApiOperation({
    summary: 'Get Asset',
  })
  async getAssetTransactions(
    @Param('assetId') assetId: number,
    @Query() query: GetWalletTransactionDto,
  ) {
    return await this.assetService.getAssetTransactions(
      assetId,
      query.start,
      query.count,
    )
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
