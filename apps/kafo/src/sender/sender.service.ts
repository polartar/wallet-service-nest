import { Injectable } from '@nestjs/common'
import { IData } from '@rana/core'

@Injectable()
export class SenderService {
  submit(data: IData) {
    return {
      sent: true,
      data,
    }
  }
}
