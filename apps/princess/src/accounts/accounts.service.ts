import { HttpService } from '@nestjs/axios'
import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Request,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { EAuth } from '@rana/core'
import { firstValueFrom } from 'rxjs'
import { IAccount, IShard } from './accounts.types'
import * as Sentry from '@sentry/node'
import { REQUEST } from '@nestjs/core'
import { IRequest } from './accounts.types'
import { BootstrapService } from '../bootstrap/bootstrap.service'
import { EAPIMethod } from '../wallet/wallet.types'
import { UpdateShardsDto } from './dto/update-shards.dto'

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
          : method === EAPIMethod.PUT
          ? this.httpService.put(url, body)
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

  async createAccount(
    provider: EAuth,
    providerToken: string,
    otp: string,
    accountShard,
    iCloudShard,
    passcodeKey,
    recoveryKey,
    serverShard,
    vaultShard,
  ) {
    const deviceId = this.getDeviceIdFromRequest()

    const accountId = this.getAccountIdFromRequest()
    await this.checkPair(accountId, deviceId, otp)

    const user = await this.getUserFromIdToken(
      providerToken,
      provider,
      accountId,
      {
        accountShard,
        iCloudShard,
        passcodeKey,
        recoveryKey,
        serverShard,
        vaultShard,
      },
    )

    const userWallet = await this.syncRick(user.is_new, user.account, accountId)

    if (user.is_new) {
      return {
        id: user.account.id,
        email: user.account.email,
      }
    } else {
      const payload = {
        type: provider,
        accountId: user.account.id,
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
        wallets: userWallet,
      }
    }
  }

  async getUserFromIdToken(
    token: string,
    type: EAuth | 'Anonymous',
    accountId: string,
    optionalParams?: IShard,
  ) {
    try {
      const userResponse = await firstValueFrom(
        this.httpService.post(`${this.gandalfApiUrl}/auth`, {
          idToken: token,
          type,
          accountId,
          ...optionalParams,
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

  async checkPair(accountId: string, deviceId: string, otp: string) {
    return this.apiCall(EAPIMethod.POST, this.fluffyApiUrl, 'pair', {
      userId: accountId,
      deviceId,
      otp,
    })
  }

  async syncRick(isNewUser: boolean, account: IAccount, accountId: string) {
    try {
      // if new user email, then register, then update the anonymous user with real info.
      if (isNewUser) {
        return this.apiCall(
          EAPIMethod.PUT,
          this.rickApiUrl,
          `account/${account.id}`,
          {
            email: account.email,
            name: account.name,
          },
        )
      } else {
        // combine wallets
        if (+account.id !== +accountId) {
          return this.apiCall(
            EAPIMethod.POST,
            this.rickApiUrl,
            'wallet/combine',
            {
              existingAccountId: account.id,
              anonymousId: accountId,
            },
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
    const accountId = this.getAccountIdFromRequest()
    return this.apiCall(
      EAPIMethod.PATCH,
      this.gandalfApiUrl,
      `account/${accountId}`,
      {
        ...data,
      },
    )
  }

  async getShards() {
    const accountId = this.getAccountIdFromRequest()

    return this.apiCall(
      EAPIMethod.GET,
      this.gandalfApiUrl,
      `account/${accountId}`,
    )
  }

  async deleteAccount(otp: string) {
    const accountId = this.getAccountIdFromRequest()
    const deviceId = this.getDeviceIdFromRequest()

    await this.checkPair(accountId, deviceId, otp)

    const account = await this.apiCall(
      EAPIMethod.DELETE,
      this.gandalfApiUrl,
      `account/${accountId}/${deviceId}`,
    )

    await this.apiCall(
      EAPIMethod.DELETE,
      this.rickApiUrl,
      `wallet/account/${accountId}/${deviceId}`,
    )

    return account
  }

  async signOut() {
    const deviceId = this.getDeviceIdFromRequest()
    const accountId = this.getAccountIdFromRequest()
    try {
      const tmpEmail = `signout${deviceId}@gmail.com`
      const tmpName = 'Anonymous'
      // create anonymous user
      const userResponse = await firstValueFrom(
        this.httpService.post(`${this.gandalfApiUrl}/account`, {
          email: tmpEmail,
          name: tmpName,
        }),
      )

      // create the anonymous user in rick
      await firstValueFrom(
        this.httpService.post(`${this.rickApiUrl}/wallet/signout`, {
          email: tmpEmail,
          name: tmpName,
          accountId: accountId,
          newAccountId: userResponse.data.id,
        }),
      )

      const payload = {
        type: 'anonymous',
        accountId: userResponse.data.id,
        deviceId: deviceId,
      }
      const accessToken = await this.bootstrapService.generateAccessToken(
        payload,
      )

      const refreshToken = await this.bootstrapService.generateRefreshToken(
        payload,
      )

      return {
        accountId: userResponse.data.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
      }
    } catch (err) {
      Sentry.captureException(err.message + ' in createDevice()')

      throw new BadRequestException(err.message)
    }
  }
}
