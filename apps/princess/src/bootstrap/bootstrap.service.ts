import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EEnvironment } from '../environments/environment.types'
import { firstValueFrom } from 'rxjs'
import {
  IAccessTokenPayload,
  IDeviceCreateResponse,
  IGetInfoResponse,
} from './bootstrap.types'
import { JwtService } from '@nestjs/jwt'
import * as Sentry from '@sentry/node'

@Injectable()
export class BootstrapService {
  gandalfApiUrl: string
  fluffyApiUrl: string
  rickApiUrl: string

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private jwtService: JwtService,
  ) {
    this.gandalfApiUrl = this.configService.get<string>(
      EEnvironment.gandalfAPIUrl,
    )
    this.fluffyApiUrl = this.configService.get<string>(
      EEnvironment.fluffyAPIUrl,
    )
    this.rickApiUrl = this.configService.get<string>(EEnvironment.rickAPIUrl)
  }

  async createDevice(): Promise<IDeviceCreateResponse> {
    try {
      const deviceResponse = await firstValueFrom(
        this.httpService.post(`${this.fluffyApiUrl}/device`),
      )

      const tmpEmail = `any${deviceResponse.data.deviceId}@gmail.com`
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
        this.httpService.post(`${this.rickApiUrl}/account`, {
          email: tmpEmail,
          name: tmpName,
          accountId: userResponse.data.id,
        }),
      )

      const payload = {
        type: 'anonymous',
        accountId: userResponse.data.id,
        deviceId: deviceResponse.data.deviceId,
      }
      const accessToken = await this.generateAccessToken(payload)

      const refreshToken = await this.generateRefreshToken(payload)

      return {
        otpSecret: deviceResponse.data.otp,
        id: deviceResponse.data.deviceId,
        accountId: userResponse.data.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
      }
    } catch (err) {
      Sentry.captureException(err.message + ' in createDevice()')

      throw new BadRequestException(err.message)
    }
  }
  getInfo(isIncludeHealthCheck = false): IGetInfoResponse {
    const info: IGetInfoResponse = {
      minAppVersion: '1.0.15',
      latestAppVersion: '1.0.16',
      serverVersion: '2.0.1',
    }
    if (isIncludeHealthCheck) {
      info.self = {
        rick: 'up',
        morty: 'down',
      }
      info['3rdParty'] = {
        'blockcypher.com': 'up',
        'etherscan.io': 'down',
      }
    }
    return info
  }

  async generateAccessToken(payload: IAccessTokenPayload) {
    return await this.jwtService.signAsync(payload, { expiresIn: '4h' })
  }
  async generateRefreshToken(payload: IAccessTokenPayload) {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(
        EEnvironment.jwtRefreshTokenSecret,
      ),
      expiresIn: '180 days',
    })
  }
}
