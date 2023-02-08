import { Module } from '@nestjs/common'
import { PortfolioService } from './portfolio.service'
import { HttpModule } from '@nestjs/axios'
@Module({
  imports: [HttpModule],
  providers: [PortfolioService],
})
export class PortfolioModule {}
