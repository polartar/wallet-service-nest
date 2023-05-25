import { Body, Controller, Param, Post, Put } from '@nestjs/common'
import { TotpService } from './totp.service'
import { CreatePairingDto } from './dto/create-pairing-dto'
import { IDeviceUpdate } from './totp.types'
import { VerifyDto } from './dto/verify-dto.ts'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  createPair(@Body() data: CreatePairingDto) {
    return this.service.createPair(data)
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
