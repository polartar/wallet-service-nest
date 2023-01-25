import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { IAuthData, EAuth } from './auth.types'
import { OAuth2Client } from 'google-auth-library'
import verifyAppleToken from 'verify-apple-id-token'
import { EEnvironment } from '../environments/environment.types'

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async authorize(data: IAuthData): Promise<string> {
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
        console.log({ payload })
        const email = payload.email

        return email
      } catch (err) {
        throw new Error('Invalid token')
      }
    } else if (data.type === EAuth.Apple) {
      try {
        const jwtClaims = await verifyAppleToken({
          idToken: data.idToken,
          clientId: this.configService.get(EEnvironment.googleClientID),
        })

        return jwtClaims.email
      } catch (err) {
        throw new Error('Invalid token')
      }
    } else {
      throw new Error('Unsupported type')
    }
  }
}
