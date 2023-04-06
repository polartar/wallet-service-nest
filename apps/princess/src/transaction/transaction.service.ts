import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ECoinType } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { EEnvironment } from '../environments/environment.types'
import { AxiosResponse } from 'axios'
import { IResponse } from './transaction.types'

@Injectable()
export class TransactionService {
  kafoAPIUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.kafoAPIUrl = this.configService.get<string>(EEnvironment.kafoAPIUrl)
  }

  async getFee(coin: ECoinType): Promise<IResponse> {
    try {
      const res = await firstValueFrom(
        this.httpService.get<AxiosResponse>(
          `${this.kafoAPIUrl}/transaction/fee/${coin}`,
        ),
      )
      return res.data as IResponse
    } catch (err) {
      throw new BadGatewayException('Kafo API call error')
    }
  }

  async generateTransaction(
    from: string,
    to: string,
    amount: number,
    coinType: ECoinType,
  ): Promise<IResponse> {
    try {
      const res = await firstValueFrom(
        this.httpService.post<AxiosResponse>(
          `${this.kafoAPIUrl}/transaction/generate`,
          {
            from,
            to,
            amount,
            coinType,
          },
        ),
      )
      return res.data as IResponse
    } catch (err) {
      if (err.response) {
        throw new BadRequestException(err.response.data.message)
      }
      throw new BadGatewayException('Kafo API call error')
    }
  }
}
