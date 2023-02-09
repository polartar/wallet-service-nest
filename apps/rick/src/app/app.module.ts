import { PortfolioModule } from './../portfolio/portfolio.module'
import { Module } from '@nestjs/common'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [PortfolioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
