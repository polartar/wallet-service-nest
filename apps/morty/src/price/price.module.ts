import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { PriceController } from './price.controller'
import { PriceService } from './price.service'
import { Environment } from '../environments/environment.dev'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    ConfigModule.forRoot({ load: [Environment] }), //
    HttpModule,
  ],
  controllers: [PriceController],
  providers: [PriceService],
})
export class PriceModule {}
