import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common'

import { IData } from '@rana/core'

import { SenderService } from './sender.service'

@Controller()
export class SenderController {
  constructor(private readonly service: SenderService) {}

  @Post('submit')
  submit(@Body() data: IData) {
    return this.service.submit(data)
  }
}
