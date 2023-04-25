import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { IAuthData, IAuthResponse } from './auth.types'
import { OAuth2Client } from 'google-auth-library'
import verifyAppleToken from 'verify-apple-id-token'
import { EEnvironment } from '../environments/environment.types'
import { EAuth } from '@rana/core'
import * as Sentry from '@sentry/node'
import * as SentryTracing from '@sentry/tracing'

@Injectable()
export class AuthService {
  googleClientId: string
  appleClientId: string
  constructor(private configService: ConfigService) {
    this.googleClientId = this.configService.get<string>(
      EEnvironment.googleClientID,
    )
    this.appleClientId = this.configService.get<string>(
      EEnvironment.appleClientID,
    )
  }

  async authorize(data: IAuthData, headers?: Headers): Promise<IAuthResponse> {
    SentryTracing && true // This is to ensure bundler won't optimise the sentry/tracing import (https://github.com/getsentry/sentry-javascript/issues/4731#issuecomment-1098530656)
    const sentry_trace_data = Sentry.extractTraceparentData(
      headers ? headers['sentry-trace'] : '',
    )
    const sentry_txn = Sentry.startTransaction({
      op: 'authorize',
      name: 'authorize fn in gandalf',
      ...sentry_trace_data,
    })
    if (data.type === EAuth.Google) {
      const client = new OAuth2Client(this.googleClientId)
      try {
        const response = await client.verifyIdToken({
          idToken: data.idToken,
        })

        const payload = response.getPayload()
        if (
          !payload.iss.includes('accounts.google.com') ||
          (payload.aud !== this.googleClientId &&
            payload.azp !== this.googleClientId)
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
      } finally {
        sentry_txn.finish()
      }
    } else if (data.type === EAuth.Apple) {
      try {
        const jwtClaims = await verifyAppleToken({
          idToken: data.idToken,
          clientId: this.appleClientId,
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
      } finally {
        sentry_txn.finish()
      }
    } else {
      sentry_txn.finish()
      throw new Error('Unsupported type')
    }
  }
}
