import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common'
import { NewsService } from './news.service'

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('top')
  getTopNews(@Query('count', ParseIntPipe) count?: number) {
    return this.newsService.getTopNews(count)
  }
}
