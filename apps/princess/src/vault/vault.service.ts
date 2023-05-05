import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { EAPIMethod, IRequest } from './vault.types'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import * as Sentry from '@sentry/node'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'

@Injectable()
export class VaultService {
  bristleApiUrl: string
  rickApiUrl: string
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.bristleApiUrl = this.configService.get<string>(
      EEnvironment.bristleAPIUrl,
    )
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
  }

  getAccountIdFromRequest() {
    return Number((this.request as IRequest).accountId)
  }

  async apiCall(
    method: EAPIMethod,
    apiUrl: string,
    path: string,
    body?: unknown,
  ) {
    try {
      const url = `${apiUrl}/${path}`
      const res = await firstValueFrom(
        method === EAPIMethod.POST
          ? this.httpService.post<AxiosResponse>(url, body)
          : this.httpService.get<AxiosResponse>(url),
      )
      return res.data
    } catch (err) {
      if (err.response) {
        Sentry.captureException(
          `${err.response.data.message}: ${this.bristleApiUrl}/${path} API call`,
        )
        throw new BadRequestException(err.response.data.message)
      } else {
        Sentry.captureException(
          `${err.message}: ${this.bristleApiUrl}/${path} API call`,
        )
        throw new BadRequestException(err.message)
      }
    }
  }
  async sync(parts: string[]) {
    const accountId = this.getAccountIdFromRequest()
    // const obj = await this.apiCall(EAPIMethod.POST,this.bristleApiUrl '/sync', { parts })
    const obj = {
      version: 1,
      type: 'sync',
      md5: '',
      data: {
        coins: [
          {
            BIP44: 0,
            wallets: [
              {
                wallet_index: 0,
                xpub: 'xpub6CC2ecHtJKaNm29cbw1Hfa7qpdFt1QiiwxCu8ThgRNANkAaZNUdEL9xiQMX9D6cLWxe24SAxnqoxXERV4dxTVxM6naPyVBRsKGZAs5aBUC9',
              },
            ],
          },
          {
            BIP44: 714,
            wallets: [
              {
                wallet_index: 0,
                xpub: 'xpub6Cogi4wR8arxzcrfoia821AAH6Ds3qH9LaMBpvaUBLYKNQK1UbBghYXjttSCdc9RLDtmavGcx5KVnChYb1GNwHhX1vRVncNAQwKiPWeqffU',
              },
            ],
          },
        ],
      },
    }

    if (obj) {
      const xpubs = obj.data.coins
        .filter((coin) => coin.BIP44 === 0 || coin.BIP44 === 714)
        .map((coin) => ({ BIP44: coin.BIP44, xpub: coin.wallets[0].xpub }))

      const addresses = await this.apiCall(
        EAPIMethod.POST,
        this.rickApiUrl,
        '/wallet/xpubs',
        { accountId, xpubs: xpubs },
      )
      return addresses
    }
  }
}
