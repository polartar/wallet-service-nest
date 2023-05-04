import { URDecoder } from '@ngraveio/bc-ur'
import { BadRequestException, Injectable } from '@nestjs/common'
import * as Sentry from '@sentry/node'

@Injectable()
export class AppService {
  static welcomeMessage = 'Bristle is up and running'
  get welcomeMessage() {
    return AppService.welcomeMessage
  }

  verifyPayload(parts: string[]) {
    const decoder = new URDecoder()
    let i = 0
    do {
      const part = parts[i++]
      try {
        console.log('receive', part)
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
      console.log(JSON.parse(originalMessage))
      return originalMessage
    } else {
      throw new BadRequestException('Some parts are missing in the payload')
    }
  }
}
