import { Body, Controller, Post } from '@nestjs/common'
import { TotpService } from './totp.service'
import { CheckPairingDto } from './dto/check-pairing-dto'

@Controller('totp')
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  checkPair(@Body() data: CheckPairingDto) {
    return this.service.checkPair(data)
  }

  @Post('device')
  create() {
    return this.service.createDevice()
  }
}
