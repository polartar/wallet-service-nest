import { Module } from '@nestjs/common'
import { PriceController } from './price.controller'
import { PriceService } from './price.service'

@Module({
  controllers: [PriceController],
  providers: [PriceService],
})
export class PriceModule {}
