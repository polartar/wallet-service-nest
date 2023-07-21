import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { WalletsService } from './wallet.service'
import {
  CreateWalletDto,
  WalletSwaggerResponse,
  WalletsSwaggerResponse,
} from './dto/create-wallet.dto'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdateWalletDto } from './dto/update-wallet.dto'
import {
  GetWalletPortfolioDto,
  WalletPortfolioSwaggerResponse,
} from './dto/get-wallet-portfolio.dto'
import { GetWalletTransactionDto } from './dto/get-wallet-transaction.dto'

@Controller('wallet')
@ApiTags('wallet')
export class WalletsController {
  constructor(private readonly walletService: WalletsService) {}

  @Post('')
  @ApiOkResponse({ type: WalletSwaggerResponse })
  @ApiOperation({
    summary: 'Add the wallet to the account',
  })
  async createWallet(@Body() data: CreateWalletDto) {
    if (data.assets) {
      return this.walletService.createWallet(data)
    } else {
      return this.walletService.sync(data.title, data.parts)
    }
  }

  @Get(':walletId/transactions')
  @ApiOkResponse({ type: WalletSwaggerResponse })
  @ApiOperation({
    summary:
      'Time series data, where date is timestamp (number), and the value of that date.',
  })
  async getWalletTransaction(
    @Param('walletId') walletId: string,
    @Query() query: GetWalletTransactionDto,
  ) {
    return await this.walletService.getWalletTransaction(
      walletId,
      query.start,
      query.count,
    )
  }

  @Get(':walletId/portfolio')
  @ApiOkResponse({ type: [WalletPortfolioSwaggerResponse] })
  @ApiOperation({
    summary:
      'Time series data, where date is timestamp (number), and the value of that date.',
  })
  async getWalletPortfolio(
    @Param('walletId') walletId: string,
    @Query() query: GetWalletPortfolioDto,
  ) {
    return await this.walletService.getWalletPortfolio(
      walletId,
      query.period,
      query.networks,
    )
  }

  @Get(':walletId')
  @ApiOkResponse({ type: WalletSwaggerResponse })
  @ApiOperation({
    summary:
      'Time series data, where date is timestamp (number), and the value of that date.',
  })
  async getWallet(@Param('walletId') walletId: string) {
    return await this.walletService.getWallet(walletId)
  }

  @Get('')
  @ApiOkResponse({ type: WalletsSwaggerResponse })
  @ApiOperation({
    summary:
      'Time series data, where date is timestamp (number), and the value of that date.',
  })
  async getWallets() {
    return await this.walletService.getWallets()
  }

  @Patch(':walletId')
  @ApiOperation({
    summary: 'Update the wallet object',
  })
  async updateWallet(
    @Param('walletId') walletId: string,
    @Body() data: UpdateWalletDto,
  ) {
    if (data.mnemonic === undefined && data.title === undefined) {
      throw new BadRequestException('Should input at least title or mnemonic')
    } else if (data.mnemonic && data.title) {
      throw new BadRequestException('Should input one of title or mnemonic')
    }

    return await this.walletService.updateWallet(
      walletId,
      data.title,
      data.mnemonic,
    )
  }

  @Delete(':walletId')
  @ApiOperation({
    summary: 'Delete the wallet object',
  })
  async deleteWallet(@Param('walletId') walletId: string) {
    return await this.walletService.deleteWallet(walletId)
  }
}
