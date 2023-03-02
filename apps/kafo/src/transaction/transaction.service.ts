import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import {
  ICoinType,
  ITransactionInput,
  ITransactionPush,
  ITransactionResponse,
} from './transaction.types'
import { firstValueFrom } from 'rxjs'
import { EEnvironment } from '../environments/environment.types'

@Injectable()
export class TransactionService {
  blockcypherToken: string
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.blockcypherToken = this.configService.get<string>(
      EEnvironment.blockcypherToken,
    )
  }
  async generate(data: ITransactionInput): Promise<ITransactionResponse> {
    const newtx = {
      inputs: [{ addresses: [data.from] }],
      outputs: [
        {
          addresses: [data.to],
          value: data.amount,
        },
      ],
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.blockcypher.com/v1/${
            data.coinType === ICoinType.BITCOIN
              ? 'btc/test3/txs/new'
              : `beth/test/txs/new?token=${this.blockcypherToken}`
          }`,
          JSON.stringify(newtx),
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
        data: err.response.data.tx,
      }
    }
  }
  async push(data: ITransactionPush): Promise<ITransactionResponse> {
    const trxObj = JSON.parse(data.transaction)
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.blockcypher.com/v1/${
            data.coinType === ICoinType.BITCOIN
              ? 'btc/test3/txs/send'
              : `beth/test/txs/send?token=${this.blockcypherToken}`
          }`,
          {
            ...trxObj,
          },
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
        data: err.response.data.tx,
      }
    }
  }

  async getFee(coin: ICoinType): Promise<ITransactionResponse> {
    try {
      const response: { data: any } = await firstValueFrom(
        this.httpService.get(
          `https://api.blockcypher.com/v1/${
            coin === ICoinType.BITCOIN ? 'bcy' : 'beth'
          }/test`,
        ),
      )
      const data = response.data
      //remember the fee is wei
      return {
        success: true,
        data: {
          high_fee_per_kb: data.high_fee_per_kb || data.high_gas_price,
          medium_fee_per_kb: data.medium_fee_per_kb || data.medium_gas_price,
          low_fee_per_kb: data.low_fee_per_kb || data.low_gas_price,
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
