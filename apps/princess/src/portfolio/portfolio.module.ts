import { Module } from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { HttpModule } from '@nestjs/axios'
import { PortfolioController } from './portfolio.controller'
// import { ConfigModule } from '@nestjs/config'
// import { Environment } from '../environments/environment.dev'

@Module({
  imports: [
    // ConfigModule.forRoot({ load: [Environment] }),
    HttpModule, //
  ],
  providers: [PortfolioService],
  controllers: [PortfolioController],
})
export class PortfolioModule {}
