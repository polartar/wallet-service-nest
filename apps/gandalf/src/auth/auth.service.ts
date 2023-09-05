import { ConfigService } from '@nestjs/config'
import { BadRequestException, Injectable } from '@nestjs/common'
import { IAuthData, IAuthResponse } from './auth.types'
import { OAuth2Client } from 'google-auth-library'
import verifyAppleToken from 'verify-apple-id-token'
import { EEnvironment } from '../environments/environment.types'
import { EAuth, EFlavor, EPlatform } from '@rana/core'
import * as Sentry from '@sentry/node'
import { AccountService } from '../account/account.service'
import { TotpService } from '../totp/totp.service'

@Injectable()
export class AuthService {
  googleClientId: string
  IOSGoogleClientId: string
  appleClientId: string
  appleClientIdGreens: string
  constructor(
    private configService: ConfigService,
    private accountService: AccountService,
    private totpService: TotpService,
  ) {
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

  async tokenAuthorize(data: IAuthData): Promise<IAuthResponse> {
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

  async auth(data: IAuthData) {
    try {
      await this.totpService.checkPair({
        userId: data.accountId,
        deviceId: data.deviceId,
        otp: data.otp,
      })
      const { name, email } = await this.tokenAuthorize(data)

      let account = await this.accountService.lookup({ email })

      if (account) {
        return {
          is_new: false,
          account,
        }
      } else if (data.accountId) {
        account = await this.accountService.updateAnonymousAccount(
          data.accountId,
          name,
          email,
          {
            accountShard: data.accountShard,
            iCloudShard: data.iCloudShard,
            vaultShard: data.vaultShard,
            passcodeKey: data.passcodeKey,
            recoveryKey: data.recoveryKey,
            serverShard: data.serverShard,
          },
        )

        return {
          is_new: true,
          account: account,
        }
      } else {
        throw new Error('User not exists')
      }
    } catch (e) {
      Sentry.captureMessage(`Auth(): ${e.message}`)
      throw new BadRequestException(e?.message)
    }
  }
}
