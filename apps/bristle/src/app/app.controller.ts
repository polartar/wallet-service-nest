import { Body, Controller, Get, Post } from '@nestjs/common'

import { AppService } from './app.service'
import { ApiBody } from '@nestjs/swagger'
import { VerifyPayloadDto } from './dto/VerifyPayloadDto'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  welcome() {
    return this.appService.welcomeMessage
  }

  @Post('verify/payload')
  @ApiBody({ type: [VerifyPayloadDto] })
  async verifyPayload(@Body() data: VerifyPayloadDto[]) {
    return this.appService.verifyPayload(data)
  }
}
