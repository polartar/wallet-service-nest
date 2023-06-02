import { Module } from '@nestjs/common'
import { XpubService } from './xpub.service'
import { XpubController } from './xpub.controller'

@Module({
  providers: [XpubService],
  controllers: [XpubController],
})
export class XpubModule {}
