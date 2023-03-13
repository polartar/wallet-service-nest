import { Body, Controller, Post } from '@nestjs/common'

import { IData } from '@rana/core'

import { CryptoService } from './crypto.service'

@Controller()
export class CryptoController {
  constructor(private readonly service: CryptoService) {}

  @Post('sign')
  sign(@Body() data: IData) {
    return this.service.sign(data)
  }

  @Post('verify')
  verify(@Body() data: IData) {
    return this.service.verify(data)
  }
}
