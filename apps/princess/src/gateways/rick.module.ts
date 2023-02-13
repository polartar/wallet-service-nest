import { Module } from '@nestjs/common'
import { RickGateway } from './rick.gateway'
import { PortfolioService } from '../portfolio/portfolio.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [
    RickGateway, //
    PortfolioService,
  ],
})
export class RickModule {}
