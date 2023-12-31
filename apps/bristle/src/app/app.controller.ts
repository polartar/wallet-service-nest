import { Body, Controller, Get, Post } from '@nestjs/common'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  welcome() {
    return this.appService.welcomeMessage
  }

  @Post('sync')
  async verifyPayload(@Body() data: { parts: string[] }) {
    return this.appService.verifyPayload(data.parts)
  }
}
