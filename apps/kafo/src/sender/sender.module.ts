import { Module } from '@nestjs/common'
import { SenderController } from './sender.controller'
import { SenderService } from './sender.service'

@Module({
  controllers: [SenderController],
  providers: [SenderService],
})
export class SenderModule {}
