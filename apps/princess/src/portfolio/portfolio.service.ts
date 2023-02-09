import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse, AxiosError } from 'axios'

import { Observable, catchError } from 'rxjs'
import { IWallet } from './portfolio.types'

@Injectable()
export class PortfolioService {
  constructor(private readonly httpService: HttpService) {}
  getWalletHistory(accountId: number): Observable<AxiosResponse<IWallet[]>> {
    return this.httpService
      .get<IWallet[]>(`http://localhost:3334/api/portfolio/${accountId}`)
      .pipe(
        catchError((error: AxiosError) => {
          throw 'An error happened!'
        }),
      )
  }
}
