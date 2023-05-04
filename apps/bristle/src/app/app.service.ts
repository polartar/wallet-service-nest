import { URDecoder } from '@ngraveio/bc-ur'
import { Injectable } from '@nestjs/common'
import { VerifyPayloadDto } from './dto/VerifyPayloadDto'

@Injectable()
export class AppService {
  static welcomeMessage = 'Bristle is up and running'
  get welcomeMessage() {
    return AppService.welcomeMessage
  }

  verifyPayload(data: VerifyPayloadDto[]) {
    for (let i = 0; i < data.length; i++) {
      const decoder = new URDecoder()
      const encode = data[i]
      decoder.receivePart(encode.part)

      if (decoder.isComplete()) {
        const ur = decoder.resultUR()
        const decoded = ur.decodeCBOR()
        const originalMessage = decoded.toString()

        if (originalMessage !== encode.message) {
          return false
        }
      } else {
        return false
      }
    }
    return true
  }
}
