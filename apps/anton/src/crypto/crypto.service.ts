import { Injectable } from '@nestjs/common'

import { IData } from '@rana/core'

@Injectable()
export class CryptoService {
  sign(data: IData) {
    return {
      signed: true,
      data,
    }
  }

  verify(data: IData) {
    return {
      verified: true,
      data,
    }
  }
}
