import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
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
}
