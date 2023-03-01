import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ITransactionInput } from './transaction.types'
import { Observable, catchError, firstValueFrom, map } from 'rxjs'
import { AxiosError, AxiosResponse } from 'axios'

@Injectable()
export class TransactionService {
  constructor(private readonly httpService: HttpService) {}
  async generate(data: ITransactionInput) {
    const newtx = {
      inputs: [{ addresses: [data.from] }],
      outputs: [{ addresses: [data.to], value: data.amount }],
    }
    const aa = await firstValueFrom(
      this.httpService.get(
        `https://api.blockcypher.com/v1/btc/main/addrs/${data.from}`,
      ),
    )
    console.log({ aa })
    return aa

    return this.httpService
      .post('https://api.blockcypher.com/v1/bcy/test/txs/new', {
        inputs: [{ addresses: ['CEztKBAYNoUEEaPYbkyFeXC5v8Jz9RoZH9'] }],
        outputs: [
          { addresses: ['CEztKBAYNoUEEaPYbkyFeXC5v8Jz9RoZH9'], value: 123 },
        ],
      })
      .pipe(
        catchError((error: AxiosError) => {
          throw 'An error happened!' + error.message
        }),
      )

    // return newtx
  }
}
