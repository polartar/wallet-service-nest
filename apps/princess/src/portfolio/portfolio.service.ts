import { Injectable } from '@nestjs/common'
import { HttpService, AxiosResponse } from '@nestjs/axios'
import { Observable } from 'rxjs'

@Injectable()
export class PortfolioService {
  constructor(private readonly httpService: HttpService) {}
  findAll(): Observable<AxiosResponse<Cat[]>> {
    return this.httpService.get('http://localhost:3000/cats')
  }
}
