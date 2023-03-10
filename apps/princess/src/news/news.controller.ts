import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common'
import { NewsService } from './news.service'
import { ESort } from './news.types'

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('top')
  getTopNews(@Query('count', ParseIntPipe) count: number) {
    return this.newsService.getTopNews(count)
  }
  @Get()
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
    return this.newsService.getNews(
      query.pageNumber,
      query.countPerPage,
      query.sort,
      query.startTime,
      query.endTime,
    )
  }
}
