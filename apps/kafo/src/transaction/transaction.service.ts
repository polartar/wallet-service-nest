import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import {
  ICoinType,
  IFeeResponse,
  ITransactionInput,
  ITransactionPush,
} from './transaction.types'
import { Observable, catchError, firstValueFrom } from 'rxjs'
import { AxiosError, AxiosResponse } from 'axios'

@Injectable()
export class TransactionService {
  constructor(private readonly httpService: HttpService) {}
  generate(data: ITransactionInput): Observable<AxiosResponse> {
    const newtx = {
      inputs: [{ addresses: [data.from] }],
      outputs: [{ addresses: [data.to], value: data.amount }],
    }

    return this.httpService
      .post(
        `https://api.blockcypher.com/v1/${
          data.coinType === ICoinType.BITCOIN ? 'bcy' : 'beth'
        }/test/txs/new`,
        JSON.stringify(newtx),
      )
      .pipe(
        catchError((error: AxiosError) => {
          throw 'An error happened!' + error.message
        }),
      )
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

  async getFee(coin: ICoinType): Promise<IFeeResponse> {
    const response: { data: IFeeResponse } = await firstValueFrom(
      this.httpService.get(
        `https://api.blockcypher.com/v1/${
          coin === ICoinType.BITCOIN ? 'bcy' : 'beth'
        }/test`,
      ),
    )

    return {
      high_fee_per_kb: response.data.high_fee_per_kb,
      medium_fee_per_kb: response.data.medium_fee_per_kb,
      low_fee_per_kb: response.data.low_fee_per_kb,
    }
  }
}
