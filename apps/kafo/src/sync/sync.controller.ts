import { Body, Controller, Get, Post } from '@nestjs/common'

import { SyncService } from './sync.service'

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('')
  async verifyPayload(@Body() data: { parts: string[] }) {
    return this.syncService.verifyPayload(data.parts)
  }
}
