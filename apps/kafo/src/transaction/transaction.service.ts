import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import {
  ICoinType,
  IFeeResponse,
  ITransactionInput,
  ITransactionPush,
  ITransactionResponse,
} from './transaction.types'
import { Observable, catchError, firstValueFrom } from 'rxjs'
import axios, { AxiosError, AxiosResponse } from 'axios'

@Injectable()
export class TransactionService {
  constructor(private readonly httpService: HttpService) {}
  async generate(data: ITransactionInput): Promise<AxiosResponse> {
    const newtx = {
      inputs: [{ addresses: [data.from] }],
      outputs: [{ addresses: [data.to], value: data.amount }],
    }

    const res = await firstValueFrom(
      this.httpService.post(
        `https://api.blockcypher.com/v1/${
          data.coinType === ICoinType.BITCOIN ? 'btc' : 'beth'
        }/test3/txs/new`,
        newtx,
      ),
    )
    return res.data
  }
  push(data: ITransactionPush): Observable<AxiosResponse> {
    const trxObj = JSON.parse(data.transaction)

    return this.httpService
      .post(
        `https://api.blockcypher.com/v1/${
          data.coinType === ICoinType.BITCOIN ? 'bcy' : 'beth'
        }/test/txs/send`,
        {
          ...trxObj,
        },
      )
      .pipe(
        catchError((error: AxiosError) => {
          throw 'An error happened!' + error.message
        }),
      )
  }

  async getFee(coin: ICoinType): Promise<ITransactionResponse> {
    try {
      const response: { data: IFeeResponse } = await firstValueFrom(
        this.httpService.get(
          `https://api.blockcypher.com/v1/${
            coin === ICoinType.BITCOIN ? 'bcy' : 'beth'
          }/test`,
        ),
      )

      return {
        status: true,
        data: {
          high_fee_per_kb: response.data.high_fee_per_kb,
          medium_fee_per_kb: response.data.medium_fee_per_kb,
          low_fee_per_kb: response.data.low_fee_per_kb,
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
