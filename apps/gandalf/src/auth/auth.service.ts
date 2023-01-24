import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { IAuthData } from './auth.controller'
import { OAuth2Client } from 'google-auth-library'
import verifyAppleToken from 'verify-apple-id-token'

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async authorize(data: IAuthData): Promise<string> {
    if (data.type === 'GOOGLE') {
      const google_client_id = this.configService.get('google_client_id')
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
        const email = payload.email

        return email
      } catch (err) {
        throw new Error('Invalid token')
      }
    } else if (data.type === 'APPLE') {
      try {
        const jwtClaims = await verifyAppleToken({
          idToken: data.idToken,
          clientId: this.configService.get('apple_client_id'),
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
