import { Controller, Get, StreamableFile } from '@nestjs/common'

import { AppService } from './app.service'
import { createReadStream } from 'fs'
import { Public } from '../gateway/decorators/public.decorator'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('cryptoapisverifydomain')
  async verifyCryptoDomain() {
    try {
      const file = createReadStream('./cryptoapisverifydomain.txt')
      return new StreamableFile(file)
      // eslint-disable-next-line no-empty
    } catch (err) {}
  }
}
