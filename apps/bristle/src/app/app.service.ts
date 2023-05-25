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

      return originalMessage
    } else {
      throw new BadRequestException('Some parts are missing in the payload')
    }
  }
}
