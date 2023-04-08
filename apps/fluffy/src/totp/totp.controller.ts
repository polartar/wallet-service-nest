import { Body, Controller, Post } from '@nestjs/common'
import { TotpService } from './totp.service'
import { IPair } from './totp.types'
import { CreateDeviceDto } from './dto/CreateDeviceDto'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  pair(@Body() data: CreateDeviceDto) {
    return this.service.pair(data)
  }

  @Post('device')
  crete(@Body('hardware_id') hardwareId: string) {
    return this.service.createDevice(hardwareId)
  }

  // @Post('verify')
  // verify(@Body() { accountID, deviceID, token }: { [key: string]: string }) {
  //   return this.service.verify(accountID, deviceID, token)
  // }
}
