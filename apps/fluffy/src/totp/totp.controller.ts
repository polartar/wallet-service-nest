import { Body, Controller, Post } from '@nestjs/common'
import { TotpService } from './totp.service'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('generate')
  generate(@Body() accountID: string) {
    return this.service.generate(accountID)
  }

  @Post('verify')
  verify(
    @Body() accountID: string,
    @Body() deviceID: string,
    @Body() token: string,
  ) {
    return this.service.verify(accountID, deviceID, token)
  }
}
