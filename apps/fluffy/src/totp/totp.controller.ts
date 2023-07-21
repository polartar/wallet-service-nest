import { Body, Controller, Post } from '@nestjs/common'
import { TotpService } from './totp.service'
import { CreatePairingDto } from './dto/create-pairing-dto'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  createPair(@Body() data: CreatePairingDto) {
    return this.service.createPair(data)
  }

  @Post('device')
  create() {
    return this.service.createDevice()
  }
}
