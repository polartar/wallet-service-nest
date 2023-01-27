import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { IAuthData, EAuth, IAuthResponse } from './auth.types'
import { OAuth2Client } from 'google-auth-library'
import verifyAppleToken from 'verify-apple-id-token'
import { EEnvironment } from '../environments/environment.types'

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async authorize(data: IAuthData): Promise<IAuthResponse> {
    if (data.type === EAuth.Google) {
      const google_client_id = this.configService.get<string>(
        EEnvironment.googleClientID,
      )
      const client = new OAuth2Client(google_client_id)
      try {
        const response = await client.verifyIdToken({
          idToken: data.idToken,
        })

        const payload = response.getPayload()

        if (
          payload.iss !== 'accounts.google.com' &&
          payload.aud !== google_client_id
        ) {
          throw new Error('Invalid Google Id token')
        }

        return {
          email: payload.email,
          name: payload.name,
        }
      } catch (err) {
        throw new Error('Invalid token')
      }
    } else if (data.type === EAuth.Apple) {
      try {
        const jwtClaims = await verifyAppleToken({
          idToken: data.idToken,
          clientId: this.configService.get(EEnvironment.googleClientID),
        })

        return {
          email: jwtClaims.email,
          name: jwtClaims.name,
        }
      } catch (err) {
        throw new Error('Invalid token')
      }
    } else {
      throw new Error('Unsupported type')
    }
  }
}
