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
import * as Sentry from '@sentry/node'

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
          Sentry.captureException(`Kafo internal error: ${err.message}`)

          throw new InternalServerErrorException('Something went wrong')
        } else if (err.response.data?.statusCode === 500) {
          Sentry.captureException(
            `Kafo API error: ${err.response.data.message}`,
          )

          throw new InternalServerErrorException(err.response.data.message)
        }

        Sentry.captureException(`Kafo api: ${err.response.data.message}`)

        throw new BadRequestException(err.response.data.message)
      }

      Sentry.captureException(`Kafo API call error: ${err.message}`)

      throw new BadGatewayException('Something went wrong')
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
    publicKey: string,
  ): Promise<IResponse> {
    return this.apiCall(EAPIMethod.POST, `transaction/generate`, {
      from,
      to,
      amount,
      coinType,
      publicKey,
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
    return this.apiCall(EAPIMethod.POST, `transaction/nft/generate`, {
      from,
      to,
      contractAddress,
      tokenId,
      type,
      amount,
    })
  }

  async publishNFTTransaction(signedHash: string): Promise<IResponse> {
    return this.apiCall(EAPIMethod.POST, `transaction/nft/publish`, {
      signedHash,
    })
  }
}
