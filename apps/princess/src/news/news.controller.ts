import { Controller, Get, ParseIntPipe, Query, UsePipes } from '@nestjs/common'
import { NewsService } from './news.service'
import { ESort } from './news.types'
import { NewsValidationPipe } from './news.pipe'

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('top')
  getTopNews(@Query('count', ParseIntPipe) count: number) {
    return this.newsService.getTopNews(count)
  }

  @Get()
  @UsePipes(new NewsValidationPipe())
  getNews(
    @Query()
    query: {
      sort: ESort
      countPerPage: number
      pageNumber: number
      startTime: Date
      endTime: Date
    },
  ) {
    return this.newsService.getNews(query)
  }
}
