import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { IAuthData, IAuthResponse } from './auth.types'
import { OAuth2Client } from 'google-auth-library'
import verifyAppleToken from 'verify-apple-id-token'
import { EEnvironment } from '../environments/environment.types'
import { EAuth, EFlavor, EPlatform } from '@rana/core'
import * as Sentry from '@sentry/node'

@Injectable()
export class AuthService {
  googleClientId: string
  IOSGoogleClientId: string
  appleClientId: string
  appleClientIdGreens: string
  constructor(private configService: ConfigService) {
    this.googleClientId = this.configService.get<string>(
      EEnvironment.googleClientID,
    )
    this.IOSGoogleClientId = this.configService.get<string>(
      EEnvironment.IOSGoogleClientID,
    )
    this.appleClientId = this.configService.get<string>(
      EEnvironment.appleClientID,
    )
    this.appleClientIdGreens = this.configService.get<string>(
      EEnvironment.appleClientIDGreens,
    )
  }

  async authorize(data: IAuthData): Promise<IAuthResponse> {
    if (data.type === EAuth.Google) {
      const googleClientId =
        data.platform === EPlatform.Android
          ? this.googleClientId
          : this.IOSGoogleClientId
      const client = new OAuth2Client(googleClientId)
      try {
        const response = await client.verifyIdToken({
          idToken: data.idToken,
        })

        const payload = response.getPayload()
        if (
          !payload.iss.includes('accounts.google.com') ||
          (payload.aud !== googleClientId && payload.azp !== googleClientId)
        ) {
          throw new Error('Invalid Google Id token')
        }

        return {
          email: payload.email,
          name: payload.name,
        }
      } catch (err) {
        Sentry.captureException(err, {
          extra: { message: err.message, src: 'gandalf authorize api' },
        })
        throw new Error(err.message)
      }
    } else if (data.type === EAuth.Apple) {
      try {
        const jwtClaims = await verifyAppleToken({
          idToken: data.idToken,
          clientId:
            data.flavor == EFlavor.FCAT
              ? this.appleClientId
              : this.appleClientIdGreens,
        })

        return {
          email: jwtClaims.email,
          name: jwtClaims.name,
        }
      } catch (err) {
        Sentry.captureException(err, {
          extra: { message: err.message, src: 'gandalf authorize api' },
        })
        throw new Error(err.message)
      }
    } else {
      throw new Error('Unsupported type')
    }
  }
}
