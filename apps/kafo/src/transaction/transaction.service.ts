import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import {
  ICoinType,
  IFeeResponse,
  ITransactionInput,
  ITransactionPush,
  ITransactionResponse,
} from './transaction.types'
import { firstValueFrom } from 'rxjs'
import { EEnvironment } from '../environments/environment.types'

@Injectable()
export class TransactionService {
  blockcypherToken: string
  isProduction: boolean
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.blockcypherToken = this.configService.get<string>(
      EEnvironment.blockcypherToken,
    )
    this.isProduction = this.configService.get<boolean>(
      EEnvironment.isProduction,
    )
  }
  async generate(data: ITransactionInput): Promise<ITransactionResponse> {
    const newTx = {
      inputs: [{ addresses: [data.from] }],
      outputs: [
        {
          addresses: [data.to],
          value: data.amount,
        },
      ],
    }
    let params = ''
    if (this.isProduction) {
      params =
        data.coinType === ICoinType.BITCOIN
          ? 'btc/main/txs/new'
          : `eth/main/txs/new?token=${this.blockcypherToken}`
    } else {
      params =
        data.coinType === ICoinType.BITCOIN
          ? 'btc/test3/txs/new'
          : `beth/test/txs/new?token=${this.blockcypherToken}`
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.blockcypher.com/v1/${params}`,
          JSON.stringify(newTx),
        ),
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (err) {
      return {
        success: false,
        errors: err.response.data.errors || [err.response.data.error],
        data: err.response.data,
      }
    }
  }
  async push(data: ITransactionPush): Promise<ITransactionResponse> {
    let params
    if (this.isProduction) {
      params =
        data.coinType === ICoinType.BITCOIN
          ? 'btc/main/txs/send'
          : `eth/main/txs/send?token=${this.blockcypherToken}`
    } else {
      params =
        data.coinType === ICoinType.BITCOIN
          ? 'btc/test3/txs/send'
          : `beth/test/txs/send?token=${this.blockcypherToken}`
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.blockcypher.com/v1/${params}`,
          data.transaction,
        ),
      )
      return {
        success: true,
        data: response.data,
      }
    } catch (err) {
      return {
        success: false,
        errors: err.response.data.errors || [err.response.data.error],
        data: err.response.data,
      }
    }
  }

  async getFee(coin: ICoinType): Promise<IFeeResponse> {
    let params
    if (this.isProduction) {
      params = coin === ICoinType.BITCOIN ? 'btc/main' : `eth/main`
    } else {
      params = coin === ICoinType.BITCOIN ? 'btc/test3' : `beth/test`
    }

    try {
      const response: { data: any } = await firstValueFrom(
        this.httpService.get(`https://api.blockcypher.com/v1/${params}`),
      )
      const data = response.data
      const feeObj = {
        high_fee: data.high_fee_per_kb || data.high_gas_price,
        medium_fee: data.medium_fee_per_kb || data.medium_gas_price,
        low_fee: data.low_fee_per_kb || data.low_gas_price,
      }
      const unit = coin == ICoinType.BITCOIN ? 8 : 18
      const convertedObj = {
        high_fee: ethers.utils.formatUnits(feeObj.high_fee.toString(), unit),
        medium_fee: ethers.utils.formatUnits(
          feeObj.medium_fee.toString(),
          unit,
        ),
        low_fee: ethers.utils.formatUnits(feeObj.low_fee.toString(), unit),
      }
      return {
        success: true,
        data: {
          original: feeObj,
          convert: convertedObj,
        },
      }
    } catch (err) {
      Logger.error(err.message)
      return {
        success: false,
      }
    }
  }
}
