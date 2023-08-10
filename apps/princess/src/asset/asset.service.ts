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

  getAccountIdFromRequest(): string {
    return (this.request as IRequest).accountId
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
    if (data.xPub) {
      return await this.rickApiCall(EAPIMethod.POST, 'asset/discover', data)
    } else {
      asset = await this.rickApiCall(EAPIMethod.POST, 'asset', data)
      return [asset]
    }
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
      if (transactions.length === 0) {
        return []
      }
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
          usdPrice: (+value * price).toString(),
          fiatAmount: (+amount * price).toString(),
        }
      })

      return newTransactions
    } catch (err) {
      Sentry.captureException('Something went wrong in Morty service')

      throw new InternalServerErrorException("Couldn't get market price ")
    }
  }

  async getAsset(assetId: string) {
    const accountId = this.getAccountIdFromRequest()
    const asset = await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}?accountId=${accountId}`,
    )

    // if (asset.transaction) {
    //   // const transactions = await this.addUSDPrice([asset.transaction])

    //   asset.balance = {
    //     fiat: transactions[0].usdPrice,
    //     crypto: transactions[0].balance,
    //   }

    //   delete asset.transaction
    // } else {
    //   asset.balance = {
    //     fiat: '0',
    //     crypto: '0',
    //   }
    // }

    return asset
  }

  async getAssetTransactions(assetId: string, start = 0, count = 100) {
    const accountId = this.getAccountIdFromRequest()
    return await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}/transactions?accountId=${accountId}&count=${count}&start=${start}`,
    )

    // return await this.addUSDPrice(transactions)
  }

  async getAssetPortfolio(assetId, period?: EPeriod) {
    const accountId = this.getAccountIdFromRequest()

    const transaction = await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}/portfolio?accountId=${accountId}&period=${
        period ? period : EPeriod.Month
      }`,
    )

    if (transaction) {
      const portfolio = await this.addUSDPrice([transaction])
      return {
        fiat: portfolio[0].usdPrice,
        balance: portfolio[0].balance,
      }
    } else {
      return {
        fiat: 0,
        crypto: 0,
      }
    }
  }

  async getAssetNFTs(assetId: string, pageNumber?: number) {
    const page = pageNumber || 1

    return await this.rickApiCall(
      EAPIMethod.GET,
      `asset/${assetId}/nft?pageNumber=${page}`,
    )
  }
}
