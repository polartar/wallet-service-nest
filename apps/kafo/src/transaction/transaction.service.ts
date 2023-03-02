import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import {
  ICoinType,
  ITransactionInput,
  ITransactionPush,
  ITransactionResponse,
} from './transaction.types'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class TransactionService {
  constructor(private readonly httpService: HttpService) {}
  async generate(data: ITransactionInput): Promise<ITransactionResponse> {
    const newtx = {
      inputs: [{ addresses: [data.from] }],
      outputs: [{ addresses: [data.to], value: data.amount }],
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.blockcypher.com/v1/${
            data.coinType === ICoinType.BITCOIN ? 'btc' : 'beth'
          }/test3/txs/new`,
          JSON.stringify(newtx),
        ),
      )
      return {
        status: true,
        data: response.data,
      }
    } catch (err) {
      Logger.error(err.message)
      return {
        status: false,
      }
    }
  }
  async push(data: ITransactionPush): Promise<ITransactionResponse> {
    const trxObj = JSON.parse(data.transaction)
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://api.blockcypher.com/v1/${
            data.coinType === ICoinType.BITCOIN ? 'btc' : 'beth'
          }/test3/txs/send`,
          {
            ...trxObj,
          },
        ),
      )
      return {
        status: true,
        data: response.data,
      }
    } catch (err) {
      return {
        status: false,
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
        status: true,
        data: {
          high_fee_per_kb: data.high_fee_per_kb || data.high_gas_price,
          medium_fee_per_kb: data.medium_fee_per_kb || data.medium_gas_price,
          low_fee_per_kb: data.low_fee_per_kb || data.low_gas_price,
        },
      }
    } catch (err) {
      Logger.error(err.message)
      return {
        status: false,
      }
    }
  }
}
