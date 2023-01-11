import { Injectable } from '@nestjs/common'
import { randomBytes, randomUUID } from 'crypto'
import { encode } from 'hi-base32'
import { totp } from 'otplib'

@Injectable()
export class TotpService {
  private async _getRandomKey(len: number = 10) {
    return new Promise<string>((resolve) =>
      randomBytes(len, (error, buffer) => {
        resolve(buffer.toString())
      }),
    )
  }

  private _encodeBase32(key: string) {
    return encode(key)
  }

  private _generateUniqueId() {
    return randomUUID()
  }

  private async pairDevice(
    accountID: string,
    deviceID: string,
    secret: string,
  ) {
    // TODO Save to DB
  }

  async generate(accountID: string) {
    const randomKey = await this._getRandomKey()
    const deviceID = this._generateUniqueId()
    const encodedKey = this._encodeBase32(randomKey)
    // Pair accountID with devideID using the key
    await this.pairDevice(accountID, deviceID, encodedKey)

    const token = totp.generate(encodedKey)
    return {
      totp: token,
      deviceID: this._generateUniqueId(),
    }
  }

  private async _verifyDevicePairing(accountID: string, deviceID: string) {
    // TODO Check DB
    return true
  }

  private async _verifyToken(deviceID: string, token: string) {
    const secret = '' // TODO Get from DB
    return totp.check(token, secret)
  }

  async verify(accountID: string, deviceID: string, token: string) {
    return (
      this._verifyDevicePairing(accountID, deviceID) &&
      this._verifyToken(deviceID, token)
    )
  }
}
