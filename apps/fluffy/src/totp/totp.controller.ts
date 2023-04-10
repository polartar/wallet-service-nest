import { Body, Controller, Param, Post, Put } from '@nestjs/common'
import { TotpService } from './totp.service'
import { CreateDeviceDto } from './dto/CreateDeviceDto'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  pair(@Body() data: CreateDeviceDto) {
    return this.service.pair(data)
  }

  @Post('device')
  crete(@Body('hardwareId') hardwareId: string) {
    return this.service.createDevice(hardwareId)
  }

  @Put(':deviceId/account/:accountId')
  updatePassCode(
    @Param('deviceId') deviceId: string,
    @Param('accountId') accountId: number,
    @Body('passCodeKey') passCodeKey: string,
  ) {
    return this.service.updatePassCode(deviceId, accountId, passCodeKey)
  }
}
