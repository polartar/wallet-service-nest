import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse, AxiosError } from 'axios'

import { Observable, catchError } from 'rxjs'

@Injectable()
export class PortfolioService {
  constructor(private readonly httpService: HttpService) {}
  getWalletHistory(accountId: number): Observable<AxiosResponse> {
    return this.httpService
      .get<AxiosResponse>(`http://localhost:3334/api/portfolio/${accountId}`)
      .pipe(
        catchError((error: AxiosError) => {
          throw 'An error happened!' + error.message
        }),
      )
  }
}
