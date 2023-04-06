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
import { EAPIMethod, ENFTTypes, IResponse } from './transaction.types'

@Injectable()
export class TransactionService {
  kafoAPIUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.kafoAPIUrl = this.configService.get<string>(EEnvironment.kafoAPIUrl)
  }

  async apiCall(
    method: EAPIMethod,
    path: string,
    body?: unknown,
  ): Promise<IResponse> {
    try {
      const url = `${this.kafoAPIUrl}/${path}`
      const res = await firstValueFrom(
        method === EAPIMethod.POST
          ? this.httpService.post<AxiosResponse>(url, body)
          : this.httpService.get<AxiosResponse>(url),
      )
      if ((res.data as IResponse).success) {
        return res.data
      } else {
        throw new InternalServerErrorException((res.data as IResponse).error)
      }
    } catch (err) {
      if (err.response) {
        if (err.response.statusCode === 500) {
          throw new InternalServerErrorException(err.message)
        } else if (err.response.data?.statusCode === 500) {
          throw new InternalServerErrorException(
            'Something went wrong in Kafo API',
          )
        }
        throw new BadRequestException(err.response.data.message)
      }
      throw new BadGatewayException('Kafo API call error')
    }
  }

  async getFee(coin: ECoinType): Promise<IResponse> {
    return this.apiCall(EAPIMethod.GET, `transaction/fee/${coin}`)
  }

  async generateTransaction(
    from: string,
    to: string,
    amount: number,
    coinType: ECoinType,
  ): Promise<IResponse> {
    return this.apiCall(EAPIMethod.POST, `transaction/generate`, {
      from,
      to,
      amount,
      coinType,
    })
  }

  async publishTransaction(
    transaction: unknown,
    coinType: ECoinType,
  ): Promise<IResponse> {
    return this.apiCall(EAPIMethod.POST, 'transaction/publish', {
      transaction,
      coinType,
    })
  }

  async generateNFTTransaction(
    from: string,
    to: string,
    contractAddress: string,
    tokenId: number,
    type: ENFTTypes,
    amount?: number,
  ): Promise<IResponse> {
    return this.apiCall(EAPIMethod.POST, `transaction/nft/raw-transaction`, {
      from,
      to,
      contractAddress,
      tokenId,
      type,
      amount,
    })
  }
}
