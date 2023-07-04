import { Module } from '@nestjs/common'
import { BootstrapController } from './bootstrap.controller'
import { BootstrapService } from './bootstrap.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    HttpModule.register({
      timeout: parseInt(process.env.httptimeout) || 0,
    }),
  ],
  controllers: [BootstrapController],
  providers: [BootstrapService],
})
export class BootstrapModule {}
