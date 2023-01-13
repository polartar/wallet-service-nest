import { Body, Controller, Post } from '@nestjs/common'
import { TotpService } from './totp.service'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  generate(@Body() { accountID }: { [key: string]: string }) {
    return this.service.generate(accountID)
  }

  @Post('verify')
  verify(@Body() { accountID, deviceID, token }: { [key: string]: string }) {
    return this.service.verify(accountID, deviceID, token)
  }
}
