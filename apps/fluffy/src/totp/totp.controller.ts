import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { TotpService } from './totp.service'
import { CreatePairingDto } from './dto/create-pairing-dto'
import { VerifyDto } from './dto/verify-dto.ts'
import { UpdateShardsDto } from './dto/update-shards-dto'

@Controller()
export class TotpController {
  constructor(private readonly service: TotpService) {}

  @Post('pair')
  createPair(@Body() data: CreatePairingDto) {
    return this.service.createPair(data)
  }

  @Post('device')
  create() {
    return this.service.createDevice()
  }

  @Patch(':deviceId')
  updateShards(
    @Param('deviceId') deviceId: string,
    @Body() data: UpdateShardsDto,
  ) {
    return this.service.updateShards(deviceId, data)
  }

  @Get(':deviceId')
  getShards(
    @Param('deviceId') deviceId: string,
    @Query('accountId') accountId: string,
  ) {
    return this.service.getShards(deviceId, accountId)
  }

  @Post('verify')
  verify(@Body() data: VerifyDto) {
    return this.service.verify(data.deviceId, data.userId, data.otp)
  }
}
