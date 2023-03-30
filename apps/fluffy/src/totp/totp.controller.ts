import { Body, Controller, Post } from '@nestjs/common'
import { TotpService } from './totp.service'
import { IPairGenerate } from './totp.types'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  pair(@Body() data: IPairGenerate) {
    return this.service.generate(data.user_id, data.device_id)
  }

  @Post('device')
  crete(@Body('hardware_id') hardwareId: string) {
    return this.service.createDevice(hardwareId)
  }

  @Post('verify')
  verify(@Body() { accountID, deviceID, token }: { [key: string]: string }) {
    return this.service.verify(accountID, deviceID, token)
  }
}
