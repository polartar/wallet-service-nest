import { Controller, Get } from '@nestjs/common'
import { XpubService } from './xpub.service'

@Controller('xpub')
export class XpubController {
  constructor(private readonly xpubService: XpubService) {}

  @Get()
  getData() {
    return this.xpubService.discoverAddresses()
  }
}
