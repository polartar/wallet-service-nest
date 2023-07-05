import { HttpService } from '@nestjs/axios'
import {
  BadRequestException,
  Inject,
  Injectable,
  Request,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { REQUEST } from '@nestjs/core'
import { EEnvironment } from '../environments/environment.types'
import { IRequest } from '../accounts/accounts.types'
import { CreateAssetDto } from './dto/create-asset.dto'
import { EAPIMethod, ITransaction } from '../wallet/wallet.types'
import { firstValueFrom } from 'rxjs'
import * as Sentry from '@sentry/node'
import { ECoinTypes, EPeriod } from '@rana/core'
import { formatUnits, isAddress } from 'ethers/lib/utils'
import { IMarketData } from './asset.types'
import { CoinService } from '../coin/coin.service'

@Injectable()
export class AssetService {
  rickApiUrl: string

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly coinService: CoinService,
  ) {
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
  }

  getAccountIdFromRequest(): number {
    return Number((this.request as IRequest).accountId)
  }

  async rickApiCall(method: EAPIMethod, path: string, body?: unknown) {
    try {
      const url = `${this.rickApiUrl}/${path}`
      const res = await firstValueFrom(
        method === EAPIMethod.POST
          ? this.httpService.post(url, body)
          : this.httpService.get(url),
      )

      return res.data
    } catch (err) {
      if (err.response) {
        Sentry.captureException(
          `${err.response.data.message}: ${this.rickApiUrl}/${path} API call`,
        )
        throw new BadRequestException(err.response.data.message)
      } else {
        Sentry.captureException(
          `${err.message}: ${this.rickApiUrl}/${path} API call`,
        )

        throw new BadRequestException(err.message)
      }
    }
  }

  async createAsset(data: CreateAssetDto) {
    let asset
    if (data.address) {
      asset = await this.rickApiCall(EAPIMethod.POST, 'asset', data)
    } else {
      asset = await this.rickApiCall(EAPIMethod.POST, 'asset/discover', data)
    }

    return asset
  }

  getPrice(source: IMarketData[], timestamp: number) {
    const index = source.findIndex(
      (market) =>
        new Date(market.periodEnd).getTime() / 1000 >= +timestamp &&
        +timestamp >= new Date(market.periodStart).getTime() / 1000,
    )

    return index !== -1 ? source[index].vwap : source[source.length - 1].vwap
  }

  async addUSDPrice(transactions: ITransaction[]) {
    try {
      const ethMarketHistories = await this.coinService.getHistoricalData(
        ECoinTypes.ETHEREUM,
        EPeriod.All,
      )

      const btcMarketHistories = await this.coinService.getHistoricalData(
        ECoinTypes.BITCOIN,
        EPeriod.All,
      )
      // const ethFee = await this.transactionService.getFee(ENetworks.ETHEREUM)
      // const btcFee = await this.transactionService.getFee(ENetworks.BITCOIN)

      const newTransactions = transactions.map((transaction) => {
        const isEthereum = isAddress(transaction.from)
        const source = isEthereum ? ethMarketHistories : btcMarketHistories
        const decimal = isEthereum ? 18 : 8
        const price = this.getPrice(source, transaction.timestamp)
        const value = formatUnits(transaction.balance, decimal)
        const amount = formatUnits(transaction.amount, decimal)
        return {
          ...transaction,
          cryptoAmount: transaction.amount,
          fiatBalance: (+value * price).toString(),
          fiatAmount: (+amount * price).toString(),
        }
      })

      return newTransactions
    } catch (err) {
      Sentry.captureException('Something went wrong in Morty service')

      throw new InternalServerErrorException("Couldn't get market price ")
    }
  }

  async getAsset(assetId: number) {
    const accountId = this.getAccountIdFromRequest()
    const asset = await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}?accountId=${accountId}`,
    )
    if (asset) {
      const transactions = await this.addUSDPrice(asset.transactions)
      asset.balance = {
        fiat: transactions[0].fiatBalance,
        crypto: transactions[0].balance,
      }
      return asset
    } else {
      return null
    }
  }

  async getAssetTransactions(assetId: number, count = 50, start = 0) {
    const accountId = this.getAccountIdFromRequest()
    return await this.rickApiCall(
      EAPIMethod.GET,
      `asset${assetId}/transactions?accountId=${accountId}&count=${count}&start=${start}`,
    )
  }

  async getAssetPortfolio(assetId, period?: EPeriod) {
    const accountId = this.getAccountIdFromRequest()

    return await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}/portfolio?accountId=${accountId}&period=${
        period ? period : EPeriod.Month
      }`,
    )
  }

  async getAssetNFTs(assetId: number, pageNumber?: number) {
    const page = pageNumber || 1

    return await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}/nft?pageNumber=${page}`,
    )
  }
}
