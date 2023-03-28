import { Body, Controller, Post } from '@nestjs/common'
import { TotpService } from './totp.service'
import { IPairGenerate } from './totp.types'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  generate(@Body() data: IPairGenerate) {
    return this.service.generate(data.accountId, data.deviceId)
  }

  @Post('verify')
  verify(@Body() { accountID, deviceID, token }: { [key: string]: string }) {
    return this.service.verify(accountID, deviceID, token)
  }
}
