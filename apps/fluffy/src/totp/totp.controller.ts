import { Body, Controller, Param, Post, Put, Headers } from '@nestjs/common'
import { TotpService } from './totp.service'
import { CreateDeviceDto } from './dto/CreateDeviceDto'
import { IDeviceUpdate } from './totp.types'
import { VerifyDto } from './dto/VerifyDto.ts'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  pair(@Body() data: CreateDeviceDto, @Headers() headers: Headers) {
    return this.service.pair(data, headers)
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

  @Post('verify')
  verify(@Body() data: VerifyDto) {
    return this.service.verify(data.deviceId, data.userId, data.otp)
  }
}
