import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ENetworks } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { EEnvironment } from '../environments/environment.types'
import { ENFTTypes } from './transaction.types'
import * as Sentry from '@sentry/node'
import { EAPIMethod } from '../wallet/wallet.types'

@Injectable()
export class TransactionService {
  kafoAPIUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.kafoAPIUrl = this.configService.get<string>(EEnvironment.kafoAPIUrl)
  }

  async apiCall(method: EAPIMethod, path: string, body?: unknown) {
    try {
      const url = `${this.kafoAPIUrl}/${path}`
      const res = await firstValueFrom(
        method === EAPIMethod.POST
          ? this.httpService.post(url, body)
          : this.httpService.get(url),
      )
      return res.data
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

  async getFee(network: ENetworks) {
    return this.apiCall(EAPIMethod.GET, `transaction/fee/${network}`)
  }

  async generateTransaction(
    from: string,
    to: string,
    amount: string,
    publicKey: string,
    network: ENetworks,
    transferMessage: string,
    ercToken: string,
  ) {
    return await this.apiCall(EAPIMethod.POST, `transaction/generate`, {
      from,
      to,
      amount,
      publicKey,
      network,
      transferMessage,
      ercToken,
    })
  }

  async publishTransaction(
    serializedTransaction: string,
    signedPayloads: [],
    network: ENetworks,
  ) {
    return await this.apiCall(EAPIMethod.POST, 'transaction/publish', {
      serializedTransaction,
      signedPayloads,
      network,
    })
  }

  async generateNFTTransaction(
    from: string,
    to: string,
    contractAddress: string,
    publicKey: string,
    tokenId: number,
    type: ENFTTypes,
    network: ENetworks,
    amount?: number,
  ) {
    return await this.apiCall(EAPIMethod.POST, `transaction/nft/generate`, {
      from,
      to,
      contractAddress,
      tokenId,
      type,
      amount,
      publicKey,
      network,
    })
  }

  async publishNFTTransaction(
    serializedTransaction: string,
    signedPayloads: [],
    network: ENetworks,
  ) {
    return this.apiCall(EAPIMethod.POST, `transaction/nft/publish`, {
      serializedTransaction,
      signedPayloads,
      network,
    })
  }

  async generateVaultTransaction(
    serializedTransaction: string,
    derivedIndex: number,
    network: ENetworks,
  ) {
    return await this.apiCall(
      EAPIMethod.POST,
      'transaction/vault-transaction',
      { serializedTransaction, derivedIndex, network },
    )
  }

  async publishVaultTransaction(
    serializedTransaction: string,
    parts: string[],
    network: ENetworks,
  ) {
    return await this.apiCall(
      EAPIMethod.POST,
      'transaction/vault-transaction/send',
      { serializedTransaction, parts, network },
    )
  }
}
