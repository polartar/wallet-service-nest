import { Injectable } from '@nestjs/common'
import { IAuthData } from './auth.controller'
import { OAuth2Client } from 'google-auth-library'
import verifyAppleToken from 'verify-apple-id-token'

@Injectable()
export class AuthService {
  async authorize(data: IAuthData): Promise<string> {
    if (data.type === 'GOOGLE') {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
      try {
        const response = await client.verifyIdToken({
          idToken: data.idToken,
        })

        const payload = response.getPayload()

        if (
          payload.iss !== 'accounts.google.com' &&
          payload.aud !== process.env.GOOGLE_CLIENT_ID
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
          clientId: process.env.APPLE_CLIENT_ID,
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
