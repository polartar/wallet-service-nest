import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Request,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EAuth } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import {
  IAccount,
  ICreateAccountResponse,
  IShard,
  IWallet,
} from './accounts.types'
import * as Sentry from '@sentry/node'
import { REQUEST } from '@nestjs/core'
import { IRequest } from './accounts.types'
import { BootstrapService } from '../bootstrap/bootstrap.service'
import { EAPIMethod } from '../wallet/wallet.types'
import { CreateAccountDto } from './dto/create-account.dto'
import { UpdateShardsDto } from './dto/update-shartds.dto'

@Injectable()
export class AccountsService {
  rickApiUrl: string
  fluffyApiUrl: string
  gandalfApiUrl: string

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private bootstrapService: BootstrapService,
  ) {
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
    this.gandalfApiUrl = this.configService.get<string>(
      EEnvironment.gandalfAPIUrl,
    )
    this.fluffyApiUrl = this.configService.get<string>(
      EEnvironment.fluffyAPIUrl,
    )
  }

  getAccountIdFromRequest(): string {
    return (this.request as IRequest).accountId
  }

  getDeviceIdFromRequest(): string {
    return (this.request as IRequest).deviceId
  }

  // validateAccountId(accountId: string) {
  //   if (accountId === this.getAccountIdFromRequest()) {
  //     return true
  //   } else {
  //     throw new BadRequestException('Account Id  not matched')
  //   }
  // }

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
          ? this.httpService.post(url, body)
          : method === EAPIMethod.PATCH
          ? this.httpService.patch(url, body)
          : method === EAPIMethod.DELETE
          ? this.httpService.delete(url)
          : this.httpService.get(url),
      )
      return res.data
    } catch (err) {
      if (err.response) {
        Sentry.captureException(
          `${err.response.data.message}: ${apiUrl}/${path} API call`,
        )
        throw new BadRequestException(err.response.data.message)
      } else {
        Sentry.captureException(`${err.message}: ${apiUrl}/${path} API call`)
        throw new BadRequestException(err.message)
      }
    }
  }

  // async rickAPICall(method: EAPIMethod, path: string, body?: unknown) {
  //   try {
  //     const url = `${this.rickApiUrl}/${path}`
  //     const res = await firstValueFrom(
  //       method === EAPIMethod.POST
  //         ? this.httpService.post(url, body)
  //         : this.httpService.get(url),
  //     )
  //     return res.data
  //   } catch (err) {
  //     const message = err.response ? err.response.data.message : err.message
  //     Sentry.captureException(`rickAPICall(): ${message}`)

  //     if (err.response) {
  //       throw new InternalServerErrorException(message)
  //     }
  //     throw new BadGatewayException(`Rick server connection error: ${message}`)
  //   }
  // }

  // async fluffyAPICall(path, body) {
  //   try {
  //     const url = `${this.fluffyApiUrl}/${path}`
  //     const res = await firstValueFrom(
  //       this.httpService.put<AxiosResponse>(url, body),
  //     )
  //     return res.data
  //   } catch (err) {
  //     const message = err.response ? err.response.data.message : err.message

  //     Sentry.captureException(`fluffyAPICall(): ${message}`)

  //     if (err.response) {
  //       throw new InternalServerErrorException(message)
  //     }

  //     throw new BadGatewayException(
  //       `Fluffy server connection error: ${message}`,
  //     )
  //   }
  // }

  // async updatePassCode(
  //   accountId: number,
  //   deviceId: string,
  //   passCodeKey: string,
  // ) {
  //   this.validateAccountId(accountId)

  //   const path = `${deviceId}/accounts/${accountId}`
  //   return this.fluffyAPICall(path, { passCodeKey })
  // }

  // async updateIsCloud(accountId: number, deviceId: string, isCloud: boolean) {
  //   this.validateAccountId(accountId)

  //   const path = `${deviceId}/accounts/${accountId}`
  //   return this.fluffyAPICall(path, { isCloud })
  // }

  // async getAccount(accountId: number) {
  //   try {
  //     const accountResponse = await firstValueFrom(
  //       this.httpService.get(`${this.gandalfApiUrl}/auth/${accountId}`),
  //     )
  //     return accountResponse.data
  //   } catch (err) {
  //     Sentry.captureException(`getAccount(): ${err.message}`)
  //     throw new BadGatewayException(err.message)
  //   }
  // }

  // async syncAccount(hash: string): Promise<IWallet[]> {
  //   const accountId = this.getAccountIdFromRequest()

  //   const isSync = await this.apiCall(
  //     EAPIMethod.GET,
  //     this.rickApiUrl,
  //     `account/hash?accountId=${accountId}&hash=${hash}`,
  //   )

  //   if (isSync) {
  //     return []
  //   } else {
  //     return await this.apiCall(
  //       EAPIMethod.GET,
  //       this.rickApiUrl,
  //       `account/${accountId}`,
  //     )
  //   }
  // }

  async createAccount(
    provider: EAuth,
    providerToken: string,
    otp: string,
    accountShard,
    iCloudshard,
    passcodeKey,
    recoveryKey,
    serverShard,
    vaultShard,
  ) {
    const deviceId = this.getDeviceIdFromRequest()

    const accountId = this.getAccountIdFromRequest()

    const user = await this.getUserFromIdToken(
      providerToken,
      provider,
      accountId,
    )

    const userWallet = await this.syncRick(user.is_new, user.account, accountId)

    await this.checkPair(user.account.id, deviceId, otp, {
      accountShard,
      iCloudshard,
      passcodeKey,
      recoveryKey,
      serverShard,
      vaultShard,
    })

    if (user.is_new) {
      return {
        id: user.account.id,
        email: user.account.email,
      }
    } else {
      const payload = {
        type: provider,
        accountId: accountId,
        idToken: providerToken,
        deviceId,
      }
      const accessToken = await this.bootstrapService.generateAccessToken(
        payload,
      )
      const refreshToken = await this.bootstrapService.generateRefreshToken(
        payload,
      )

      return {
        id: user.account.id,
        email: user.account.email,
        accessToken,
        refreshToken,
        ...userWallet.data,
      }
    }
  }

  async getUserFromIdToken(
    token: string,
    type: EAuth | 'Anonymous',
    accountId?: string,
  ) {
    try {
      const userResponse = await firstValueFrom(
        this.httpService.post(`${this.gandalfApiUrl}/auth`, {
          idToken: token,
          type,
          accountId,
        }),
      )
      return userResponse.data
    } catch (err) {
      Sentry.captureMessage(`SignIn(Gandalf): ${err.message} with ${accountId}`)
      if (err.response) {
        throw new UnauthorizedException(err.response.data.message)
      } else {
        throw new BadGatewayException('Gandalf API call error')
      }
    }
  }

  async checkPair(
    accountId: string,
    deviceId: string,
    otp: string,
    optionalParams?: IShard,
  ) {
    this.apiCall(EAPIMethod.POST, this.fluffyApiUrl, 'pair', {
      userId: accountId,
      deviceId,
      otp,
      ...optionalParams,
    })
    // try {
    //   await firstValueFrom(
    //     this.httpService.post(`${this.fluffyApiUrl}/pair`, {
    //       userId: accountId,
    //       deviceId,
    //       otp,
    //       ...optionalParams,
    //     }),
    //   )
    // } catch (err) {
    //   Sentry.captureMessage(`SignIn(Fluffy): ${err.message} with ${deviceId}`)
    //   if (err.response) {
    //     throw new BadRequestException(err.response.data.message)
    //   } else {
    //     throw new BadGatewayException('Fluffy API call error')
    //   }
    // }
  }

  async syncRick(isNewUser: boolean, account: IAccount, accountId: string) {
    try {
      // if new user email, then register, then update the anonymous user with real info.
      if (isNewUser) {
        return await firstValueFrom(
          this.httpService.put(`${this.rickApiUrl}/account/${account.id}`, {
            email: account.email,
            name: account.name,
            accountId: account.id,
          }),
        )
      } else {
        // combine wallets
        if (+account.id !== +accountId) {
          return await firstValueFrom(
            this.httpService.post(`${this.rickApiUrl}/wallet/combine`, {
              existingAccountId: account.id,
              anonymousId: accountId,
            }),
          )
        }
      }
    } catch (err) {
      Sentry.captureMessage(`SignIn(Rick): ${err.message} with ${accountId}`)
      if (err.response) {
        throw new InternalServerErrorException(err.response.data.message)
      } else {
        throw new BadGatewayException('Rick API call error')
      }
    }
  }

  async updateShards(data: UpdateShardsDto) {
    const deviceId = this.getDeviceIdFromRequest()
    const accountId = this.getAccountIdFromRequest()
    return this.apiCall(EAPIMethod.PATCH, this.fluffyApiUrl, `${deviceId}`, {
      ...data,
      userId: accountId,
    })
  }

  async getShards() {
    const deviceId = this.getDeviceIdFromRequest()
    const accountId = this.getAccountIdFromRequest()
    return this.apiCall(
      EAPIMethod.GET,
      this.fluffyApiUrl,
      `${deviceId}?accountId=${accountId}`,
    )
  }
}
