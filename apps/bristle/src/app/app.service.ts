import { URDecoder } from '@ngraveio/bc-ur'
import { BadRequestException, Injectable } from '@nestjs/common'
import * as Sentry from '@sentry/node'
import zlib = require('zlib')
import { ExPubTypes } from './app.types'

@Injectable()
export class AppService {
  static welcomeMessage = 'Bristle is up and running'

  get welcomeMessage() {
    return AppService.welcomeMessage
  }

  async Gunzip(str: string) {
    return new Promise((resolve, reject) => {
      const buf = Buffer.from(str, 'base64')
      zlib.gunzip(buf, (err, buffer) => {
        if (err) {
          reject('Invalid liquid data')
        }
        const plain = buffer.toString('utf8')
        const data = JSON.parse(JSON.parse(plain))

        if (data.coins && Array.isArray(data.coins)) {
          resolve(data.coins)
        } else {
          reject('Invalid liquid data')
        }
      })
    })
  }

  async verifyPayload(parts: string[]) {
    if (!Array.isArray(parts)) {
      throw new BadRequestException('Parts should be array')
    }
    const decoder = new URDecoder()
    let i = 0
    do {
      const part = parts[i++]

      try {
        decoder.receivePart(part)
      } catch (err) {
        Sentry.captureException(`${err.message} in ${part}`)
        throw new BadRequestException(err.message)
      }
    } while (!decoder.isComplete() && i < parts.length)

    if (decoder.isSuccess()) {
      const ur = decoder.resultUR()
      const decoded = ur.decodeCBOR()
      const originalMessage = decoded.toString()

      let coins
      try {
        coins = await this.Gunzip(JSON.parse(originalMessage).data)

        return coins
      } catch (err) {
        Sentry.captureException(
          `verifyPayload(): ${err.message}: ${originalMessage}`,
        )

        throw new BadRequestException(err.message)
      }
    } else {
      throw new BadRequestException('Some parts are missing in the payload')
    }
  }
}
