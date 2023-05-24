import {
  BadRequestException,
  Inject,
  Injectable,
  Request,
} from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { EAPIMethod, IRequest } from './vault.types'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import * as Sentry from '@sentry/node'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'
import zlib = require('zlib')

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

  async Gunzip(str: string) {
    return new Promise((resolve, reject) => {
      const buf = Buffer.from(str, 'base64')
      zlib.gunzip(buf, (err, buffer) => {
        if (err) {
          reject('Invalid liquid data')
        }
        const plain = buffer.toString('utf8')
        const data = JSON.parse(JSON.parse(plain))

        if (data.coins && Array.isArray(data.coins)) {
          resolve(data.coins)
        } else {
          reject('Invalid liquid data')
        }
      })
    })
  }
  async sync(parts: string[]) {
    const accountId = this.getAccountIdFromRequest()

    const obj = await this.apiCall(
      EAPIMethod.POST,
      this.bristleApiUrl,
      'sync',
      { parts },
    )

    let coins
    try {
      coins = await this.Gunzip(obj.data)
    } catch (err) {
      Sentry.captureException(`Sync(): ${err.message}: ${obj.data}`)

      throw new BadRequestException(err.message)
    }

    const xpubs = coins.map((coin) => ({
      BIP44: coin.BIP44,
      xpub: coin.wallets[0].xpub,
    }))
    try {
      const addresses = await this.apiCall(
        EAPIMethod.POST,
        this.rickApiUrl,
        'wallet/xpubs',
        { accountId, xpubs: xpubs },
      )
      return addresses
    } catch (err) {
      Sentry.captureException(`Sync()/xpub: ${err.message}: ${obj.data}`)

      throw new BadRequestException(`${err.message}`)
    }
  }
}
