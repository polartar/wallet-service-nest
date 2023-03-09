import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { NewsController } from './news.controller'
import { NewsService } from './news.service'
import { Environment } from '../environments/environment.dev'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    ConfigModule.forRoot({ load: [Environment] }), //
    HttpModule,
  ],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
