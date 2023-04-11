import { Body, Controller, Param, Post, Put } from '@nestjs/common'
import { TotpService } from './totp.service'
import { CreateDeviceDto } from './dto/CreateDeviceDto'
import { IDeviceUpdate } from './totp.types'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  pair(@Body() data: CreateDeviceDto) {
    return this.service.pair(data)
  }

  @Post('device')
  crete() {
    return this.service.createDevice()
  }

  @Put(':deviceId/account/:accountId')
  updatePassCode(
    @Param('deviceId') deviceId: string,
    @Param('accountId') accountId: number,
    @Body() data: IDeviceUpdate,
  ) {
    if (data.isCloud) {
      return this.service.updateIsCloud(deviceId, accountId, data.isCloud)
    } else {
      return this.service.updatePassCode(deviceId, accountId, data.passCodeKey)
    }
  }
}
